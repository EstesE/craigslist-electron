import Controller from '@ember/controller';
// import titleCase from 'craigslist-electron/utils/title-case';
import { inject } from '@ember/service';
import config from 'craigslist-electron/config/environment';
import { set } from '@ember/object';
import { A } from '@ember/array';
import { isPresent } from '@ember/utils';
import $ from 'jquery';
// import { retry } from 'rxjs/operator/retry';

export default Controller.extend({
    notifications: inject('toast'),
    location: null,
    ourChanges: null,
    loading: false,
    myAction: null,
    showImagePicker: false,
    imagesToDownload: A(new Array()),
    loadingMessage: 'Loading...',
    page: null,

    message: async function (title, message, controller) {
        let notifications = controller.get('notifications');
        notifications.success(title, message, { progressBar: false, timeOut: 5000 });
        set(controller, 'showImagePicker', false);
        set(controller, 'imagesToDownload', []);
        controller.set('loading', false);
        controller.transitionToRoute('finished', controller.model.property.name);
    },

    showImages: async function(controller) {
        set(controller, 'loading', false);
        set(controller, 'showImagePicker', true);
    },

    actions: {
        navigate(loc) {
            this.set('ourChanges', null);
            this.set('location', loc);
            let browser = this.browser;
            browser.close();
        },

        addAnImage(image, something) {
            this.imagesToDownload.push(image);

            const https = window.requireNode('https');
            const http = window.requireNode('http');
            const url = window.requireNode('url');
            const fs = window.requireNode('fs');
            const ora = window.requireNode('ora');
            const async = window.requireNode('async');

            let downloader = function (file, callback) {
                file = config.asset.baseURL + config.asset.container + file;
                let directory = config.path;
                let filename = url.parse(file).pathname.split("/").pop();
                let progress = 0;
                let httpx = null;

                if (file.indexOf('https://') > -1) {
                    httpx = https;
                } else if (file.indexOf('http://') > -1) {
                    httpx = http;
                }

                const spinner = ora();
                if (httpx !== null) {
                    httpx.get(file, (res) => {
                        let download = function (file) {
                            httpx.get(file, (res) => {
                                spinner.start();
                                let i = 0;
                                let exists = function (fn, original) {
                                    i++;
                                    if (original === null) original = fn;
                                    if (fs.existsSync(directory + fn)) {
                                        let parts = original.split('.');
                                        return exists(parts.slice(0, -1).join('.') + '(' + i + ').' + parts[parts.length - 1], original);
                                    }
                                    return fn;
                                };

                                let nfilename = exists(filename, null);
                                let file = fs.createWriteStream(directory + nfilename, { 'flags': 'a' });

                                res.on('data', (d) => {
                                    progress += d.length;
                                    file.write(d);
                                });

                                res.on("end", () => {
                                    file.end();
                                    spinner.succeed(`${progress} - ${nfilename}`);
                                    callback();
                                });

                            }).on('error', (e) => {
                                spinner.fail(`Error: ${e.message}\n`);
                            });
                        };

                        if (res.statusCode === 200) {
                            download(file, httpx, callback);
                        } else if (res.statusCode === 301 || res.statusCode === 302) {
                            file = res.headers.location;
                            if (res.headers.location.indexOf('https://') > -1) {
                                httpx = https;
                            } else {
                                httpx = http;
                            }
                            download(file, httpx, callback);
                        } else {
                            spinner.fail(`Error: statusCode ${res.statusCode}`);
                        }
                    }).on('error', (e) => {
                        spinner.fail(`Error: ${e.message}\n`);
                    });
                } else {
                    spinner.fail('File URLs should start with "https://" or "http://".\n');
                }
            }

            let q = async.queue(function (task, callback) {
                downloader(task, callback);
                // Remove image
                for (let i = 0; i < something.model.length; i++) {
                    if (image == something.model[i].src) {
                        something.model.removeAt(i);
                    }
                }
            }, 5);

            q.drain = function () {
                // console.log('Finished downloading...');
            };

            q.push(image);
        },

        onSave() {
            const controller = this;
            const folder = './ember-electron/resources/downloads/';
            const fs = window.requireNode('fs');
            let files = fs.readdirSync('./ember-electron/resources/downloads/');
            let page = this.page;
            let browser = this.browser;
            let message = this.message;

            if (page) {

                let x = async function (files, page, folder, browser) {
                    // TODO: Add a config entry to determine how many times to attempt to upload an image.
                    let uploadImage = async function(file, page, folder, browser, c) {
                        // console.log(c);
                        let myError = null;
                        let input = '';
                        try {
                            input = await page.$('input[name="file"]', { waitUntil: 'networkidle2' }, ).catch(err => {
                                // console.log(err);
                                myError = err;
                            });
                            await page.waitFor(1000);
                            try {
                                await input.uploadFile(folder + file);
                            } catch (e) {
                                let notifications = controller.get('notifications');
                                notifications.warning(`Retrying to upload image ${file}`, 'Warning', { progressBar: false, timeOut: 3000 });
                                myError = e;
                            }
                        } catch (e) {
                            let notifications = controller.get('notifications');
                            notifications.warning(`Warning - ${file}`, e, { progressBar: false, timeOut: 5000 });
                            myError = e;
                        }
                        if (isPresent(myError)) {
                            await uploadImage(file, page, folder, browser, c + 1);
                        }
                        await page.waitFor(500);
                    };
                    
                    for (let i = 0; i < files.length; i++) {
                        await page.waitFor(1000);
                        
                        controller.set('loading', true);
                        controller.set('loadingMessage', `Uploading ${files[i]}`);
                        await uploadImage(files[i], page, folder, browser, 0);

                        if (i === files.length - 1) {
                            controller.set('loadingMessage', 'Finishing up posting process...');
                            await page.waitFor(1500);
                            await page.click(".bigbutton");
                            await page.waitFor(1500);
                            await page.click('button[value="Continue"]');

                            controller.set('loadingMessage', 'Finalizing...');
                            await message(`Ad placed for ${controller.model.property.name}`, 'Success', controller);
                        }
                    }
                };
                x(files, page, folder, browser);
            }
        },

        test(loc) {
            let controller = this;
            controller.set('ourChanges', null);
            this.set('location', loc);
            let location = this.get('location');
            const puppeteer = window.requireNode('puppeteer');
            this.set('loading', true);

            // Read in a json file for testing...
            let fs = window.requireNode('fs');
            let path = window.requireNode('path');
            let contents = fs.readFileSync(path.resolve() + '/ember-electron/resources/post.json');
            contents = JSON.parse(contents);
            contents.postNumber = parseInt(contents.postNumber) + 1;
            let f = fs.createWriteStream(path.resolve() + '/ember-electron/resources/post.json');
            f.write(JSON.stringify(contents));

            (async () => {
                const browser = await puppeteer.launch({ headless: false });
                const pages = await browser.pages();
                const page = await pages[0];

                set(this, 'page', page); // Assign page
                set(this, 'browser', browser);

                controller.set('loadingMessage', 'Logging In...');
                await page.goto('https://accounts.craigslist.org/login', { waitUntil: 'networkidle2' }, ).catch(err => {
                    let notifications = controller.get('notifications');
                    notifications.error('Error', err, { progressBar: false, timeOut: 0, extendedTimeOut: 0 });
                    browser.close();
                });

                // // Add JQuery
                // controller.set('loadingMessage', 'Injecting the Query of J\'s');
                // await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' });
                // const title = await page.evaluate(() => {
                //     const $ = window.$; //otherwise the transpiler will rename it and won't work
                //     const jQuery = $;
                //     return $('h1 > span').text();
                // });

                // Type into search box.
                await page.type('input#inputEmailHandle', config.craigslist.emailHandle);
                await page.waitFor(250);
                await page.type('input#inputPassword', config.craigslist.password);
                await page.waitFor(250);
                await page.click('button.accountform-btn');

                await page.waitFor(2000);
                controller.set('loadingMessage', 'Redirecting...');
                await page.goto(`https://${location.hostname}.craigslist.org/d/apts-housing-for-rent/search/apa`, { waitUntil: 'networkidle2' });

                // Wait for the results page to load and display the results.
                let resultsSelector = '.post';
                await page.waitForSelector(resultsSelector);

                // Extract the results from the page.
                const links = await page.evaluate(el => el.innerHTML, await page.$('.post'));
                controller.set('loadingMessage', 'Navigating...');
                await page.goto($(links.trim())[0].href, { awaitUntil: 'networkidle2' });

                // // Get crypted value from form
                // let crypted = await page.evaluate(() => {
                //     return document.querySelector('input[name="cryptedStepCheck"]').value;
                // });

                // // Get form action
                // let action = await page.evaluate(() => {
                //     return document.querySelector('form').action;
                // });

                // Navigate
                await page.waitFor(1000);
                await page.evaluate(() => {
                    document.querySelector('input[value="ho"]').click();
                    document.querySelector('button[value="Continue"]').click();
                });

                await page.waitFor(1000);
                await page.goto(page._target._targetInfo.url.replace('type', 'hcat'), { awaitUntil: 'networkidle2' });

                // More navigation
                await page.waitFor(500);
                await page.evaluate(() => {
                    document.querySelector('input[value="1"]').click();
                    document.querySelector('button[value="Continue"]').click();
                });

                // Main page to populate
                controller.set('loadingMessage', 'Populating form...');
                await page.waitFor(500);
                await page.type('#PostingTitle', contents.PostingTitle + contents.postNumber);
                await page.type('#GeographicArea', contents.GeographicArea);
                await page.type('#postal_code', contents.postal_code);
                
                await page.type('#PostingBody', contents.PostingBody);
                await page.type("input[name='price']", contents.price);
                await page.waitFor(500);
                await page.click("input[name='pets_cat']");
                await page.click("input[name='pets_dog']");
                await page.click("input[value='A']");
                await page.type("input[name='contact_name']", contents.contact_name);
                await page.type("input[name='contact_phone']", contents.contact_phone);
                await page.waitFor(500);

                await page.click("button[name='go']");

                // Cross street page
                await page.waitFor(2000);
                await page.click('.continue');

                // Images page
                controller.set('loadingMessage', 'Getting images ready...');
                await page.waitFor(2000);
                await page.click('#classic');
                await page.waitFor(2000);

                await this.showImages(controller);
            })();
        }
    }
});
