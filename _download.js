const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
const ora = require('ora');

// let file = 'http://mirror.cc.columbia.edu/pub/software/kde-applicationdata/neon/images/neon-useredition/20180705-1025/neon-useredition-20180705-1025-amd64.iso';
let file = 'https://files.kde.org/neon/images/neon-useredition/current/neon-useredition-20180705-1025-amd64.iso';

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
        let download = function(file) {
            httpx.get(file, (res) => {
                spinner.start();
                let i = 0;
                let exists = function(fn, original) {
                    i++;
                    if (original === null) original = fn;
                    if (fs.existsSync(fn)) {
                        let parts = original.split('.');
                        return exists(parts.slice(0, -1).join('.') + '(' + i + ').' + parts[parts.length -1], original);
                    }
                    console.log(`\nDownloading ${fn}\n`);
                    return fn;
                };
                
                let nfilename = exists(filename, null);
                let file = fs.createWriteStream(nfilename, { 'flags': 'a' });

                res.on('data', (d) => {
                    progress += d.length;
                    if (progress > 1024) {
                        spinner.text = `[${parseFloat((progress / 1024) / 1024).toFixed(2)} MiB] [${progress} bytes]`;
                    } else if (progress > 1048576) {
                        spinner.text = `[${parseFloat(((progress / 1024) / 1024 / 1024)).toFixed(2)} GiB] [${progress} bytes]`;
                    } else if (progress > 1073741824) {
                        spinner.text = `[${parseFloat((((progress / 1024) / 1024 / 1024 / 1024))).toFixed(2)} TiB] [${progress} bytes]`;
                    }
                    file.write(d, encoding = 'binary');
                });

                res.on("end", () => {
                    file.end();
                    spinner.succeed(progress);
                });

            }).on('error', (e) => {
                spinner.fail(`Error: ${e.message}\n`);
            });
        };

        if (res.statusCode === 200) {
            download(file, httpx);
        } else if (res.statusCode === 301 || res.statusCode === 302) {
            file = res.headers.location;
            if (res.headers.location.indexOf('https://') > -1) {
                httpx = https;
            } else {
                httpx = http;
            }
            download(file, httpx);
        } else {
            spinner.fail(`Error: statusCode ${res.statusCode}`);
        }
    }).on('error', (e) => {
        spinner.fail(`Error: ${e.message}\n`);
    });
} else {
    spinner.fail('File URLs should start with "https://" or "http://".\n');
}
