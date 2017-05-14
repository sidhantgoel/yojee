// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)

    // configuration =================
    app.use(express.static(__dirname + '/app'));                 // set the static files location /public/img will be /img for users                                      // log every request to the console
    app.use('/node_modules', express.static(__dirname + '/node_modules'));
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

    // listen (start app with node server.js) ======================================
    app.listen(8000);
    console.log("App listening on port 8000");
