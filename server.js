const express = require('express');
const path = require('path');
const npmRequest = require('request');
const app = express();

const ipsumUrl = 'http://loripsum.net/api/3/medium/plaintext';
let chicks = require("./chicks.json");

// implement service to work with ngResource: https://www.sitepoint.com/creating-crud-app-minutes-angulars-resource/
app.get('/api/chicks', (request, response) => {
    let promises = [];
    chicks.forEach((chick) => {
        if(!chick.description) {
            promises.push(new Promise((resolve, reject) => {
                npmRequest(ipsumUrl, function(error, response, body) {
                    if(error) {
                        reject();
                    } else {
                        chick.description = body;
                        resolve();
                    }
                });
            }));
        }
    });
    Promise.all(promises).then(() => response.json(chicks))
    .catch(() => {
        response.statusCode = 500;
        response.end();
    });
});

app.get('/api/chicks/*', (request, response) => {
    let name = request.url.replace('/api/chicks/', '');
    let chickFound = false;
    chicks.forEach((chick) => {
        if(chick.name.toLowerCase() == name.toLowerCase()) {
            chickFound = true;
            
            if(!chick.description) {
                new Promise((resolve, reject) => {
                    npmRequest(ipsumUrl, function(error, response, body) {
                        if(error) {
                            reject();
                        } else {
                            chick.description = body;
                            resolve();
                        }                        
                    });
                })
                .then(() => response.json(chick))
                .catch(() => {
                    response.statusCode = 500;
                    response.end();
                });
            } else {
                response.json(chick);
            }
        }
    });
    if(!chickFound) {
        response.statusCode = 404;
        response.end();
    }
});

app.use(express.static('.'));
app.get('*', (request, response) => {
    response.sendFile(path.join(__dirname, './index.html'));
});

app.listen(8080, () => {
    console.log('Express Web Server running...')
});