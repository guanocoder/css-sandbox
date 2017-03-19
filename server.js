const express = require('express');
const path = require('path');
const npmRequest = require('request');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const ipsumUrl = 'http://loripsum.net/api/3/medium/plaintext';
let chicks = require("./chicks.json");

// implement service to work with ngResource: https://www.sitepoint.com/creating-crud-app-minutes-angulars-resource/

// serves ngResource.query() request
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

// serves ngResource.save() request
app.post('/api/chicks', (request, response) => {
    let newChick = {
        name: request.body.name,
        fullName: request.body.fullName,
        img: request.body.img,
        description: request.body.description,
        url: request.body.url
    };
    let chickAlreadyExists = false;

    chicks.forEach((chick) => {
        if(chick.name.toLowerCase() == newChick.name.toLowerCase())
            chickAlreadyExists = true;
    })

    if(chickAlreadyExists)
        response.statusCode = 500;
    else {
        chicks.unshift(newChick);
        response.statusCode = 201;
    }
    response.end();
});

// serves ngResource.get('/api/chicks/:name') request
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

// serves ngResource.update('/api/chicks/:name') request
app.put('/api/chicks/:name', (request, response) => {
    let name = request.params.name;
    let updatedChick = {
        name: request.body.name,
        fullName: request.body.fullName,
        img: request.body.img,
        description: request.body.description,
        url: request.body.url
    };    
    let chickFound = false;
    for(let i = 0; i < chicks.length; i++) {
        if(chicks[i].name.toLowerCase() == name.toLowerCase()) {
            chickFound = true;
            chicks[i] = updatedChick;
            response.statusCode = 204;
        }
    }
    if(!chickFound) {
        response.statusCode = 404;
    }
    response.end();
});

app.use(express.static('.'));
app.get('*', (request, response) => {
    response.sendFile(path.join(__dirname, './index.html'));
});

app.listen(8080, () => {
    console.log('Express Web Server running...')
});