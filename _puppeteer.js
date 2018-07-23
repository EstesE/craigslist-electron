const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const a = require('async');
const notifier = require('node-notifier');

let contents = fs.readFileSync(path.resolve() + '/ember-electron/resources/post.json');
contents = JSON.parse(contents);

async function inject_jquery(page) {
    await page.evaluate(() => {
        var jq = document.createElement("script")
        jq.setAttribute('type', 'text/javascript');
        jq.src = "https://code.jquery.com/jquery-3.2.1.min.js"
        return new Promise((resolve) => {
            jq.addEventListener("load", () => {
                resolve();
            });
            document.getElementsByTagName("head")[0].appendChild(jq);
        });
    })
    const watchDog = page.waitForFunction('window.jQuery !== undefined');
    await watchDog;
};

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const pages = await browser.pages();
    const page = await pages[0];

    await page.goto('https://accounts.craigslist.org/login', { waitUntil: 'networkidle2' });

    // Add JQuery
    inject_jquery(page);

    // Type into search box.
    await page.type('input#inputEmailHandle', contents.email);
    await page.waitFor(500);
    await page.type('input#inputPassword', contents.password);
    await page.waitFor(500);
    await page.click('button.accountform-btn');

    await page.waitFor(3000);
    await page.goto(`https://worcester.craigslist.org/d/apts-housing-for-rent/search/apa`, { waitUntil: 'networkidle2' });

    let post = await page.evaluate(() => {
        let x = document.querySelectorAll('.post');
        return $(x[0].innerHTML.trim())[0].href;
    });
    await page.goto(post, { waitUntil: 'networkidle2' });

    await page.waitFor(2000);
    await page.click("input[value='ho']");

    await page.waitFor(2000);
    await page.click("input[value='1']");

    // Main page to populate
    await page.waitFor(2000);
    await page.type('#PostingTitle', contents.PostingTitle);
    await page.type('#GeographicArea', contents.GeographicArea);
    await page.type('#postal_code', contents.postal_code);
    await page.type('#PostingBody', contents.PostingBody);
    await page.type("input[name='price']", contents.price);
    await page.waitFor(2000);
    await page.click("input[name='pets_cat']");
    await page.click("input[name='pets_dog']");
    await page.click("input[value='A']");
    await page.type("input[name='contact_name']", contents.contact_name);
    await page.type("input[name='contact_phone']", contents.contact_phone);
    await page.waitFor(2000);

    await page.click("button[name='go']");

    // Cross street page
    await page.waitFor(2000);
    await page.click('.continue');

    // Images page
    await page.waitFor(2000);
    await page.click('#classic');
    await page.waitFor(2000);
    let filePath = path.resolve() + '/ember-electron/resources/apartment.jpg';
    let input = await page.$('input[name="file"]');
    await input.uploadFile(filePath);

    await page.waitFor(3000);
    await page.click(".done");

    // Publish
    await page.waitFor(3000);
    await page.click("button[name='go']");

    browser.close();

    notifier.notify({
        title: 'Finished',
        message: 'Craigslist ad complete.'
    });
})();