import Controller from '@ember/controller';
// import titleCase from 'craigslist-electron/utils/title-case';
import { inject } from '@ember/service';
import config from 'craigslist-electron/config/environment';
import { set } from '@ember/object';
import { A } from '@ember/array';
import { isPresent } from '@ember/utils';
import $ from 'jquery';
import { allSettled } from 'rsvp';
// import { retry } from 'rxjs/operator/retry';

export default Controller.extend({
    googleRepo: inject('google-repository'),
    notifications: inject('toast'),
    location: null,
    ourChanges: null,
    loading: false,
    myAction: null,
    showImagePicker: false,
    imagesToDownload: A(new Array()),
    loadingMessage: 'Loading...',
    page: null,
    imgCount: 0,
    addImageCount: 0,
    uploadCount: 0,
    property: null,
    pageToVisit: '',
    getDistances: config.getDistances,
    disableLocationSelector: true,

    message: async function (title, message, controller, browser) {
        let notifications = controller.get('notifications');
        notifications.success(title, message, { progressBar: false, timeOut: 5000 });
        set(controller, 'showImagePicker', false);
        set(controller, 'imagesToDownload', []);
        controller.set('loading', false);

        if (config.closeBrowserWhenFinished === true) {
            browser.close();
        }
        
        let name = controller.model.property.name;
        controller.transitionToRoute('finished', { name: name, location: controller.location, pageToVisit: controller.pageToVisit });
    },

    getAmenities: function(property) {
        let amenityString = '';
        if (isPresent(property)) {
            for(let i = 0; i < property.amenities.categories.length; i++) {
                amenityString += `<h4>${property.amenities.categories[i].name}</h4>`;
                amenityString += '<ul>';
                for (let j = 0; j < property.amenities.categories[i].items.length; j++) {
                    amenityString += `<li>${property.amenities.categories[i].items[j]}`;
                }
                amenityString += '</ul>';
            }
            return amenityString;
        }
        return amenityString;
    },

    showImages: async function(controller) {
        set(controller, 'imgCount', 0);
        set(controller, 'uploadCount', 0);
        set(controller, 'loading', false);
        set(controller, 'showImagePicker', true);
    },

    clearLocation() {
        this.set('location', null);
    },

    actions: {
        updateLocations(state) {
            console.log('updated locations');
            let controller = this;
            let locations = controller.model.locations;
            let updatedLocations = [];
            let distancePromises = [];
            let property = controller.model.property;
            locations.map((loc) => {
                if (loc.region === state) {
                    updatedLocations.push(loc);
                    if (controller.getDistances) {
                        let promise = controller.get('googleRepo').find({
                        property, loc}).then(r => {
                            return r.rows[0].elements[0].distance.text;
                        }).catch(e => {
                            debugger;
                        });
                        distancePromises.push(promise);
                    }
                }
            });

            if (controller.getDistances) {
                allSettled(distancePromises).then(function(array) {
                    for (let i = 0; i < updatedLocations.length; i++) {
                        updatedLocations[i].distance = array[i].value;
                    }
                    controller.set('disableLocationSelector', false);
                    controller.set('model.refinedLocations', updatedLocations);
                }, function(error) {
                    debugger;
                });
            } else {
                controller.set('model.refinedLocations', updatedLocations);
                this.disableLocationSelector = false;
            }
        },

        setProperty(property) {
            this.set('property', property);
            this.set('model.property', property);
            this.clearLocation();
            this.set('disableLocationSelector', true);
        },

        addAnImage(image, controller) {
            console.log(`Add image (${++this.imgCount}): ${image}`); // eslint-disable-line no-console

            // Add image to array
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
                for (let i = 0; i < controller.model.length; i++) {
                    if (image == controller.model[i].src) {
                        controller.model.removeAt(i);
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
            controller.uploadCount = 0;

            if (page) {

                let x = async function (files, page, folder, browser) {
                    // TODO: Add a config entry to determine how many times to attempt to upload an image.
                    let uploadImage = async function(file, page, folder, browser, c) {
                        console.log(`Attempt (${++c}) to upload - ${file} (${++controller.uploadCount})`); // eslint-disable-line no-console
                        let myError = null;
                        let input = '';
                        try {
                            await page.waitForSelector('input[name="file"]');
                            input = await page.$('input[name="file"]', { waitUntil: 'networkidle2' }, ).catch(err => {
                                // console.log(err);
                                myError = err;
                            });
                            try {
                                await input.uploadFile(folder + file);
                            } catch (e) {
                                let notifications = controller.get('notifications');
                                --controller.uploadCount;
                                notifications.warning(`Retrying to upload image ${file}`, 'Warning', { progressBar: false, timeOut: 3000 });
                                myError = e;
                            }
                        } catch (e) {
                            let notifications = controller.get('notifications');
                            notifications.warning(`Warning - ${file}`, e, { progressBar: false, timeOut: 5000 });
                            myError = e;
                        }
                        await page.waitFor(1000);
                        if (isPresent(myError)) {
                            await uploadImage(file, page, folder, browser, c);
                        }
                    };
                    
                    for (let i = 0; i < files.length; i++) {
                        await page.waitFor(1000);
                        
                        controller.set('loading', true);
                        controller.set('loadingMessage', `Uploading ${files[i]}<br/>(${controller.uploadCount + 1} of ${controller.imagesToDownload.length})`);
                        await uploadImage(files[i], page, folder, browser, 0);

                        if (i === files.length - 1) {
                            await page.waitFor(2000);
                            controller.set('loadingMessage', 'Finishing up posting process...');
                            await page.waitForSelector(".bigbutton");
                            await page.click(".bigbutton");
                            await page.waitForSelector('button[value="Continue"]');
                            controller.set('pageToVisit', page._target._targetInfo.title);
                            await page.click('button[value="Continue"]');

                            controller.set('loadingMessage', 'Finalizing...');
                            await message(`Ad placed for ${controller.model.property.name}`, 'Success', controller, browser);
                        }
                    }
                };
                x(files, page, folder, browser);
            }
        },

        launch(loc) {
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
                let amenities = controller.getAmenities(controller.model.property);
                let junk = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vestibulum sed arcu non odio. Ipsum consequat nisl vel pretium lectus. Sagittis vitae et leo duis. Sit amet nulla facilisi morbi tempus iaculis. Nisi est sit amet facilisis magna etiam. Aenean vel elit scelerisque mauris. Proin nibh nisl condimentum id venenatis a condimentum. Magna etiam tempor orci eu lobortis elementum nibh tellus molestie. Interdum posuere lorem ipsum dolor sit amet consectetur.</p><p>Vitae sapien pellentesque habitant morbi tristique senectus et netus et. Sit amet aliquam id diam maecenas ultricies mi. Id venenatis a condimentum vitae. Habitant morbi tristique senectus et. Pellentesque elit ullamcorper dignissim cras. Malesuada proin libero nunc consequat interdum. Urna porttitor rhoncus dolor purus non. Feugiat in ante metus dictum at tempor. Faucibus purus in massa tempor nec feugiat nisl pretium. Nibh tellus molestie nunc non blandit massa enim nec dui. Vitae sapien pellentesque habitant morbi tristique senectus et netus et. Pellentesque adipiscing commodo elit at imperdiet. Consequat semper viverra nam libero justo laoreet sit.</p>"

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

                // Login
                await page.$eval('input#inputEmailHandle', (el, value) => el.value = value, config.craigslist.emailHandle);
                await page.$eval('input#inputPassword', (el, value) => el.value = value, config.craigslist.password);
                await page.click('button.accountform-btn');

                // Redirect to the apartments page
                await page.waitFor(2000);
                controller.set('loadingMessage', 'Redirecting...');
                try {
                    await page.goto(`https://${location.hostname}.craigslist.org/d/apts-housing-for-rent/search/apa`, { waitUntil: 'networkidle2' });
                } catch(e) {
                    console.error(e); // eslint-disable-line no-console
                    browser.close();
                }

                // Extract the results from the page and navigate
                const links = await page.evaluate(el => el.innerHTML, await page.$('.post'));
                controller.set('loadingMessage', 'Navigating...');
                try {
                    await page.goto($(links.trim())[0].href, { awaitUntil: 'networkidle2' });
                } catch(e) {
                    console.error(e); // eslint-disable-line no-console
                    browser.close();
                }

                // More navigation
                // await page.waitFor(1000);
                try {
                    await page.waitForSelector('input[value="ho"]', { timeout: 5000 });
                } catch(e) {
                    let notifications = controller.get('notifications');
                    notifications.error(e, 'Error', { progressBar: false, timeOut: 10000 });
                    browser.close();
                    // TODO: Handle places like Hawaii that need additional navigation
                    setTimeout(function() {
                        window.location.reload();
                    }, 10000);
                }
                await page.evaluate(() => {
                    document.querySelector('input[value="ho"]').click();
                    document.querySelector('button[value="Continue"]').click();
                });

                await page.waitFor(1000);
                try {
                    await page.goto(page._target._targetInfo.url.replace('type', 'hcat'), { awaitUntil: 'networkidle2' });
                } catch(e) {
                    console.error(e); // eslint-disable-line no-console
                    browser.close();
                }

                // More navigation
                await page.waitFor(500);
                await page.evaluate(() => {
                    document.querySelector('input[value="1"]').click();
                    document.querySelector('button[value="Continue"]').click();
                });

                // Populate form
                controller.set('loadingMessage', 'Populating form...');
                await page.waitForSelector('#PostingTitle');
                await page.$eval('#PostingTitle', (el, value) => el.value = value, contents.PostingTitle + contents.postNumber);
                await page.$eval('#GeographicArea', (el, value) => el.value = value, `${controller.model.property.address.street}, ${controller.model.property.address.city}, ${controller.model.property.address.state.abbreviation}`);
                await page.$eval('#postal_code', (el, value) => el.value = value, controller.model.property.address.zip);
                await page.$eval('#PostingBody', (el, value) => el.value = value, contents.PostingBody + junk + amenities);
                await page.$eval("input[name='price']", (el, value) => el.value = value, contents.price);
                await page.click("input[name='pets_cat']");
                await page.click("input[name='pets_dog']");
                await page.click("input[value='A']");
                await page.waitFor(500);
                await page.$eval("input[name='contact_name']", (el, value) => el.value = value, contents.contact_name);
                await page.$eval("input[name='contact_phone']", (el, value) => el.value = value, contents.contact_phone);
                await page.click("button[name='go']");
                await page.waitFor(500);

                // Cross street page
                await page.waitForSelector('.continue');
                await page.$eval('#xstreet0', (el, value) => el.value = value, controller.model.property.address.street);
                await page.click('.continue');

                // Images page
                controller.set('loadingMessage', 'Getting images ready...');
                await page.waitForSelector('#classic');
                await page.waitFor(500);
                await page.click('#classic');
                await page.waitForSelector("input[name='file']");

                // Images section
                await this.showImages(controller);
            })();
        }
    }
});
