import Controller from '@ember/controller';
// import titleCase from 'craigslist-electron/utils/title-case';
// import config from 'craigslist-electron/config/environment';

export default Controller.extend({
    // location: null,
    // ourChanges: null,
    // loading: false,
    // myAction: null,
    // showImagePicker: false,
    // imagesToDownload: [],
    // loadingMessage: 'Loading...',
    // page: null,

    // message: function (title, message, browser, controller) {
    //     const notifier = window.requireNode('node-notifier');
    //     notifier.notify({
    //         title: title,
    //         message: message
    //     });
    //     // browser.close();
    //     debugger;
    //     controller.transitionToRoute('finished');
    // },

    // actions: {
    //     navigate(loc) {
    //         // this.set('location', null);
    //         this.set('ourChanges', null);
    //         this.set('location', loc);
    //         browser.close();
    //     },

    //     addAnImage(image, something) {
    //         // debugger;
    //         this.imagesToDownload.push(image);

    //         const https = window.requireNode('https');
    //         const http = window.requireNode('http');
    //         const url = window.requireNode('url');
    //         const fs = window.requireNode('fs');
    //         const ora = window.requireNode('ora');
    //         const async = window.requireNode('async');

    //         let downloader = function (file, callback) {
    //             // debugger;
    //             file = config.asset.baseURL + config.asset.container + file;
    //             let directory = './ember-electron/resources/downloads/';//./zDownloads/'; // Directory to save downloaded items to.
    //             let filename = url.parse(file).pathname.split("/").pop();
    //             let progress = 0;
    //             let httpx = null;

    //             if (file.indexOf('https://') > -1) {
    //                 httpx = https;
    //             } else if (file.indexOf('http://') > -1) {
    //                 httpx = http;
    //             }

    //             const spinner = ora();
    //             if (httpx !== null) {
    //                 httpx.get(file, (res) => {
    //                     let download = function (file) {
    //                         httpx.get(file, (res) => {
    //                             spinner.start();
    //                             let i = 0;
    //                             let exists = function (fn, original) {
    //                                 i++;
    //                                 if (original === null) original = fn;
    //                                 if (fs.existsSync(directory + fn)) {
    //                                     let parts = original.split('.');
    //                                     return exists(parts.slice(0, -1).join('.') + '(' + i + ').' + parts[parts.length - 1], original);
    //                                 }
    //                                 return fn;
    //                             };

    //                             let nfilename = exists(filename, null);
    //                             let file = fs.createWriteStream(directory + nfilename, { 'flags': 'a' });

    //                             res.on('data', (d) => {
    //                                 progress += d.length;
    //                                 file.write(d);
    //                             });

    //                             res.on("end", () => {
    //                                 file.end();
    //                                 spinner.succeed(`${progress} - ${nfilename}`);
    //                                 callback();
    //                             });

    //                         }).on('error', (e) => {
    //                             spinner.fail(`Error: ${e.message}\n`);
    //                         });
    //                     };

    //                     if (res.statusCode === 200) {
    //                         download(file, httpx, callback);
    //                     } else if (res.statusCode === 301 || res.statusCode === 302) {
    //                         file = res.headers.location;
    //                         if (res.headers.location.indexOf('https://') > -1) {
    //                             httpx = https;
    //                         } else {
    //                             httpx = http;
    //                         }
    //                         download(file, httpx, callback);
    //                     } else {
    //                         spinner.fail(`Error: statusCode ${res.statusCode}`);
    //                     }
    //                 }).on('error', (e) => {
    //                     spinner.fail(`Error: ${e.message}\n`);
    //                 });
    //             } else {
    //                 spinner.fail('File URLs should start with "https://" or "http://".\n');
    //             }
    //         }

    //         let q = async.queue(function (task, callback) {
    //             downloader(task, callback);
    //             // Remove image
    //             for (let i = 0; i < something.model.length; i++) {
    //                 if (image == something.model[i].src) {
    //                     something.model.removeAt(i);
    //                 }
    //             };
    //         }, 5);

    //         q.drain = function () {
    //             console.log('Finished downloading...');
    //         };


    //         // testData.forEach((item) => {
    //         q.push(image);
    //         // });
    //     },

    //     onClose(x, y, z) {
    //         // debugger;
    //     },

    //     onSave() {
    //         const controller = this;
    //         // debugger;
    //         const testFolder = './ember-electron/resources/downloads/';
    //         const fs = window.requireNode('fs');
    //         let files = fs.readdirSync('./ember-electron/resources/downloads/');
    //         let page = this.page;
    //         let browser = this.browser;
    //         let message = this.message;
    //         // debugger;

    //         if (page) {

    //             var x = async function (files, page, testFolder, browser) {
    //                 // debugger;
    //                 console.log('test');
    //                 for (let i = 0; i < files.length; i++) {
    //                     await page.waitFor(1500);
    //                     let input = await page.$('input[name="file"]');
    //                     await input.uploadFile(testFolder + files[i]);
    //                     if (i === files.length - 1) {
    //                         await page.waitFor(1500);
    //                         await page.click(".bigbutton");
    //                         await page.waitFor(2000);
    //                         await page.click('button[value="Continue"]');
    //                         // // Close our browser...
    //                         // await browser.close();

    //                         // const notifier = window.requireNode('node-notifier');
    //                         // notifier.notify({
    //                         //     title: 'Finished',
    //                         //     message: 'Craigslist ad complete.'
    //                         // });

    //                         message('Finished', 'Well Done!', browser, controller);
    //                     }
    //                 }
    //             };
    //             x(files, page, testFolder, browser);

    //             // Images page
    //             // await page.waitFor(2000);
    //             // await page.click('#classic');
    //             // await page.waitFor(2000);
    //             // let filePath = path.resolve() + '/ember-electron/resources/apartment.jpg';
    //             // let input = await page.$('input[name="file"]');
    //             // await input.uploadFile(filePath);
    //         }
    //     },

    //     showImages(controller) {
    //         // debugger;
    //         Ember.set(controller, 'loading', false);
    //         Ember.set(controller, 'showImagePicker', true);
    //     },

    //     listChanges(stuff, xction, controller) {
    //         // debugger;
    //         controller.set('loading', false);
    //         // stuff = `<form action="${action}">${stuff}</form>`;
    //         controller.set('ourChanges', stuff);
    //         controller.set('myAction', xction);

    //         let parser = new DOMParser();
    //         let doc = parser.parseFromString(stuff, "text/html");
    //         let parts = doc.querySelectorAll('input');
    //         let title = doc.querySelector("#title");

    //         // Get inputs
    //         // parts[0].classList = 'form-control'
    //         let ourParts = [];
    //         let counter = 0;
    //         for (let i = 0; i < parts.length; i++) {
    //             parts[i].classList = 'form-control';
    //             // Building labels...
    //             let label = document.createElement("label");
    //             // debugger;
    //             let node = document.createTextNode(`${parts[i].name} - ${counter}`);
    //             label.appendChild(node);
    //             ourParts.push(label);
    //             // 
    //             ourParts.push(parts[i]);

    //             // Make hidden inputs visible...
    //             if (parts[i].type === 'hidden') {
    //                 parts[i].type = 'text';
    //             }
    //             counter++;
    //         }

    //         let ConfirmEMail = document.createElement("input");
    //         ourParts.push(ConfirmEMail);
    //         ConfirmEMail.id = "ConfirmEMail"
    //         ConfirmEMail.name = "ConfirmEMail"
    //         // debugger;

    //         // Get select inputs
    //         let selects = doc.querySelectorAll('select');
    //         for (let i = 0; i < selects.length; i++) {
    //             selects[i].classList = 'form-control';
    //             // Building labels...
    //             let label = document.createElement("label");
    //             // debugger;
    //             let node = document.createTextNode(`${selects[i].name} - ${counter}`);
    //             label.appendChild(node);
    //             ourParts.push(label);
    //             // 
    //             ourParts.push(selects[i]);
    //             counter++;
    //         }

    //         // Get textarea inputs
    //         let textareas = doc.querySelectorAll('textarea');
    //         for (let i = 0; i < textareas.length; i++) {
    //             textareas[i].classList = 'form-control';
    //             // Building and add labels...
    //             let label = document.createElement("label");
    //             let node = document.createTextNode(`${textareas[i].name} - ${counter}`);
    //             label.appendChild(node);
    //             ourParts.push(label);

    //             // Add inputs
    //             ourParts.push(textareas[i]);
    //             counter++;
    //         }

    //         // Get buttons
    //         let buttons = doc.querySelectorAll('button');
    //         for (let i = 0; i < buttons.length; i++) {
    //             buttons[i].classList = 'form-control';
    //             // Building labels...
    //             let label = document.createElement("label");
    //             // debugger;
    //             let node = document.createTextNode(`${buttons[i].name} - ${counter}`);
    //             label.appendChild(node);
    //             ourParts.push(label);
    //             // 
    //             ourParts.push(buttons[i]);
    //             counter++;
    //         }

    //         // Testing: Set value
    //         ourParts[1].value = controller.model.property.name;

    //         ourParts.unshift(title);
    //         // controller.set('ourChanges', [parts[0], parts[1]]);
    //         controller.set('ourChanges', ourParts);
    //     },

    //     test(loc) {
    //         console.log(loc);
    //         let controller = this;
    //         controller.set('ourChanges', null);
    //         this.set('location', loc);
    //         let location = this.get('location');
    //         const puppeteer = window.requireNode('puppeteer');
    //         this.set('loading', true);

    //         // Read in a json file for testing...
    //         let fs = window.requireNode('fs');
    //         let path = window.requireNode('path');
    //         // var contents = fs.readFileSync(path.resolve('posts')+'/'+result.post_file);
    //         let contents = fs.readFileSync(path.resolve() + '/ember-electron/resources/post.json');
    //         // debugger;
    //         contents = JSON.parse(contents);
    //         contents.postNumber = parseInt(contents.postNumber) + 1;
    //         let f = fs.createWriteStream(path.resolve() + '/ember-electron/resources/post.json');
    //         f.write(JSON.stringify(contents));
    //         // debugger;

    //         (async () => {
    //             const browser = await puppeteer.launch({ headless: false });
    //             const pages = await browser.pages();
    //             const page = await pages[0];
    //             // debugger;
    //             Ember.set(this, 'page', page); // Assign page
    //             Ember.set(this, 'browser', browser);

    //             controller.set('loadingMessage', 'Logging In...');
    //             await page.goto('https://accounts.craigslist.org/login', { waitUntil: 'networkidle2' }, ).catch(err => {
    //                 browser.close();
    //             });

    //             // // Add JQuery
    //             // controller.set('loadingMessage', 'Injecting the Query of J\'s');
    //             // // debugger;
    //             // await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' });
    //             // const title = await page.evaluate(() => {
    //             //     const $ = window.$; //otherwise the transpiler will rename it and won't work
    //             //     const jQuery = $;
    //             //     return $('h1 > span').text();
    //             // });
    //             // debugger;

    //             // Type into search box.
    //             await page.type('input#inputEmailHandle', config.craigslist.emailHandle);
    //             await page.waitFor(500);
    //             await page.type('input#inputPassword', config.craigslist.password);
    //             await page.waitFor(500);
    //             await page.click('button.accountform-btn');

    //             await page.waitFor(3000);
    //             controller.set('loadingMessage', 'Redirecting...');
    //             await page.goto(`https://${location.hostname}.craigslist.org/d/apts-housing-for-rent/search/apa`, { waitUntil: 'networkidle2' });

    //             // Wait for the results page to load and display the results.
    //             let resultsSelector = '.post';
    //             await page.waitForSelector(resultsSelector);

    //             // Extract the results from the page.
    //             const links = await page.evaluate(el => el.innerHTML, await page.$('.post'));
    //             controller.set('loadingMessage', 'Navigating...');
    //             await page.goto($(links.trim())[0].href, { awaitUntil: 'networkidle2' });

    //             // Get crypted value from form
    //             let crypted = await page.evaluate(() => {
    //                 return document.querySelector('input[name="cryptedStepCheck"]').value;
    //             });

    //             // Get form action
    //             let action = await page.evaluate(() => {
    //                 return document.querySelector('form').action;
    //             });

    //             // Navigate
    //             await page.waitFor(1000);
    //             await page.evaluate(() => {
    //                 document.querySelector('input[value="ho"]').click();
    //                 document.querySelector('button[value="Continue"]').click();
    //             });

    //             await page.waitFor(1000);
    //             await page.goto(page._target._targetInfo.url.replace('type', 'hcat'), { awaitUntil: 'networkidle2' });

    //             // More navigation
    //             await page.waitFor(500);
    //             await page.evaluate(() => {
    //                 document.querySelector('input[value="1"]').click();
    //                 document.querySelector('button[value="Continue"]').click();
    //             });

    //             // Main page to populate
    //             controller.set('loadingMessage', 'Populating form...');
    //             await page.waitFor(2000);
    //             await page.type('#PostingTitle', contents.PostingTitle + contents.postNumber);
    //             await page.type('#GeographicArea', contents.GeographicArea);
    //             await page.type('#postal_code', contents.postal_code);
    //             await page.type('#PostingBody', contents.PostingBody);
    //             await page.type("input[name='price']", contents.price);
    //             await page.waitFor(2000);
    //             await page.click("input[name='pets_cat']");
    //             await page.click("input[name='pets_dog']");
    //             await page.click("input[value='A']");
    //             await page.type("input[name='contact_name']", contents.contact_name);
    //             await page.type("input[name='contact_phone']", contents.contact_phone);
    //             await page.waitFor(2000);

    //             await page.click("button[name='go']");

    //             // Cross street page
    //             await page.waitFor(2000);
    //             await page.click('.continue');

    //             // Images page
    //             controller.set('loadingMessage', 'Getting images ready...');
    //             await page.waitFor(2000);
    //             await page.click('#classic');
    //             await page.waitFor(2000);
    //             // let filePath = path.resolve() + '/ember-electron/resources/apartment.jpg';
    //             // let input = await page.$('input[name="file"]');
    //             // await input.uploadFile(filePath);

    //             // await page.waitFor(3000);
    //             // await page.click(".done");

    //             // // Publish
    //             // await page.waitFor(3000);
    //             // await page.click("button[name='go']");

    //             // // // Get form
    //             // // await page.waitFor(500);
    //             // // controller.set('loadingMessage', 'Gathering form elements...');
    //             // // await page.waitFor(1500);
    //             // // let form = await page.evaluate(() => {
    //             // //     let f = document.querySelector('form');
    //             // //     return f.innerHTML;
    //             // // });

    //             // // // Build title for page and add it to 'form'
    //             // // form = "<h2 id='title'>" + `${loc.region} - ${titleCase(loc.name)}` + "</h2>" + form;

    //             // // // Call our action
    //             // // this.actions.listChanges(form, action, controller);

    //             // // Close our browser...
    //             // // await browser.close();

    //             // debugger;
    //             this.actions.showImages(controller);
    //         })();
    //     }
    // }
});
