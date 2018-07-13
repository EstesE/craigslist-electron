import Controller from '@ember/controller';
import titleCase from 'craigslist-electron/utils/title-case';
import config from 'craigslist-electron/config/environment';

export default Controller.extend({
    location: null,
    ourChanges: null,
    loading: false,
    myAction: null,
    loadingMessage: 'Loading...',

    actions: {
        navigate(loc) {
            // this.set('location', null);
            this.set('ourChanges', null);
            this.set('location', loc);
        },

        listChanges(stuff, xction, controller) {
            // debugger;
            controller.set('loading', false);
            // stuff = `<form action="${action}">${stuff}</form>`;
            controller.set('ourChanges', stuff);
            controller.set('myAction', xction);

            let parser = new DOMParser();
            let doc = parser.parseFromString(stuff, "text/html");
            let parts = doc.querySelectorAll('input');
            let title = doc.querySelector("#title");
            
            // Get inputs
            // parts[0].classList = 'form-control'
            let ourParts = [];
            let counter = 0;
            for (let i = 0; i < parts.length; i++) {
                parts[i].classList = 'form-control';
                // Building labels...
                let label = document.createElement("label");
                // debugger;
                let node = document.createTextNode(`${parts[i].name} - ${counter}`);
                label.appendChild(node);
                ourParts.push(label);
                // 
                ourParts.push(parts[i]);

                // Make hidden inputs visible...
                if (parts[i].type === 'hidden') {
                    parts[i].type = 'text';
                }
                counter++;
            }

            let ConfirmEMail = document.createElement("input");
            ourParts.push(ConfirmEMail);
            ConfirmEMail.id = "ConfirmEMail"
            ConfirmEMail.name = "ConfirmEMail"
            // debugger;

            // Get select inputs
            let selects = doc.querySelectorAll('select');
            for (let i = 0; i < selects.length; i++) {
                selects[i].classList = 'form-control';
                // Building labels...
                let label = document.createElement("label");
                // debugger;
                let node = document.createTextNode(`${selects[i].name} - ${counter}`);
                label.appendChild(node);
                ourParts.push(label);
                // 
                ourParts.push(selects[i]);
                counter++;
            }

            // Get textarea inputs
            let textareas = doc.querySelectorAll('textarea');
            for (let i = 0; i < textareas.length; i++) {
                textareas[i].classList = 'form-control';
                // Building and add labels...
                let label = document.createElement("label");
                let node = document.createTextNode(`${textareas[i].name} - ${counter}`);
                label.appendChild(node);
                ourParts.push(label);

                // Add inputs
                ourParts.push(textareas[i]);
                counter++;
            }

            // Get buttons
            let buttons = doc.querySelectorAll('button');
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].classList = 'form-control';
                // Building labels...
                let label = document.createElement("label");
                // debugger;
                let node = document.createTextNode(`${buttons[i].name} - ${counter}`);
                label.appendChild(node);
                ourParts.push(label);
                // 
                ourParts.push(buttons[i]);
                counter++;
            }

            // Testing: Set value
            ourParts[1].value = controller.model.property.name;

            ourParts.unshift(title);
            // controller.set('ourChanges', [parts[0], parts[1]]);
            controller.set('ourChanges', ourParts);
        },

        test(loc) {
            console.log(loc);
            let controller = this;
            controller.set('ourChanges', null);
            this.set('location', loc);
            let location = this.get('location');
            const puppeteer = window.requireNode('puppeteer');
            this.set('loading', true);

            (async () => {
                const browser = await puppeteer.launch({ headless: false });
                const pages = await browser.pages();
                const page = await pages[0];

                controller.set('loadingMessage', 'Logging In...');
                await page.goto('https://accounts.craigslist.org/login', { waitUntil: 'networkidle2' });

                // Add JQuery
                controller.set('loadingMessage', 'Injecting the Query of J\'s');
                // debugger;
                await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'});
                const title = await page.evaluate(() => {
                    const $ = window.$; //otherwise the transpiler will rename it and won't work
                    const jQuery = $;
                    return $('h1 > span').text();
                });
                // debugger;

                // Type into search box.
                await page.type('input#inputEmailHandle', config.craigslist.emailHandle);
                await page.waitFor(500);
                await page.type('input#inputPassword', config.craigslist.password);
                await page.waitFor(500);
                await page.click('button.accountform-btn');

                await page.waitFor(3000);
                controller.set('loadingMessage', 'Redirecting...');
                await page.goto(`https://${location.hostname}.craigslist.org/d/apts-housing-for-rent/search/apa`, { waitUntil: 'networkidle2' });

                // Wait for the results page to load and display the results.
                let resultsSelector = '.post';
                await page.waitForSelector(resultsSelector);

                // Extract the results from the page.
                const links = await page.evaluate(el => el.innerHTML, await page.$('.post'));
                controller.set('loadingMessage', 'Navigating...');
                await page.goto($(links.trim())[0].href, { awaitUntil: 'networkidle2' });               

                // Get crypted value from form
                let crypted = await page.evaluate(() => {
                    return document.querySelector('input[name="cryptedStepCheck"]').value;
                });

                // Get form action
                let action = await page.evaluate(() => {
                    return document.querySelector('form').action;
                });

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

                // Get form
                await page.waitFor(500);
                controller.set('loadingMessage', 'Gathering form elements...');
                await page.waitFor(1500);
                let form = await page.evaluate(() => {
                    let f = document.querySelector('form');
                    return f.innerHTML;
                });
                
                // Build title for page and add it to 'form'
                form = "<h2 id='title'>" + `${loc.region} - ${titleCase(loc.name)}` + "</h2>" + form;
                
                // Call our action
                this.actions.listChanges(form, action, controller);

                // Close our browser...
                // await browser.close();
            })();
        }
    }
});
