const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
const ora = require('ora');
const async = require('async');

// Array of files to download
let testData = [
    'https://files.kde.org/neon/images/neon-useredition/current/neon-useredition-20180723-1347-amd64.iso',
    'https://somethingsquare.blob.core.windows.net/something-web/optimized.jpeg',
    'https://somethingsquare.blob.core.windows.net/something-web/properties/texas/texas.jpg',
    'https://somethingsquare.blob.core.windows.net/something-web/properties/arizona/arizona.jpg',
    'https://somethingsquare.blob.core.windows.net/something-web/properties/michigan/michigan.jpg',
    'https://somethingsquare.blob.core.windows.net/something-web/properties/nevada/nevada.jpg',
    'https://somethingsquare.blob.core.windows.net/something-web/properties/mississippi/mississippi.jpg',
    'https://somethingsquare.blob.core.windows.net/something-web/properties/massachusetts/massachusetts.jpg',
    'https://somethingsquare.blob.core.windows.net/something-web/properties/florida/florida.jpg',
    'https://somethingsquare.blob.core.windows.net/something-web/properties/south-carolina/south-carolina.jpg',
    'https://somethingsquare.blob.core.windows.net/something-web/properties/north-carolina/north-carolina.jpg'
];


let downloader = function (file, callback) {
    let directory = './zDownloads/'; // Directory to save downloaded items to.
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
                        // console.log(`\nDownloading ${fn}\n`);
                        return fn;
                    };

                    let nfilename = exists(filename, null);
                    let file = fs.createWriteStream(directory + nfilename, { 'flags': 'a' });

                    res.on('data', (d) => {
                        progress += d.length;
                        if (progress > 1024) {
                            spinner.text = `[${parseFloat((progress / 1024) / 1024).toFixed(2)} MiB] [${progress} bytes] - ${nfilename}`;
                        } else if (progress > 1048576) {
                            spinner.text = `[${parseFloat(((progress / 1024) / 1024 / 1024)).toFixed(2)} GiB] [${progress} bytes] - ${nfilename}`;
                        } else if (progress > 1073741824) {
                            spinner.text = `[${parseFloat((((progress / 1024) / 1024 / 1024 / 1024))).toFixed(2)} TiB] [${progress} bytes] - ${nfilename}`;
                        }
                        file.write(d, encoding = 'binary');
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
}, 5);

q.drain = function() {
    console.log('Finished downloading...');
};


testData.forEach((item) => {
    q.push(item);
});

