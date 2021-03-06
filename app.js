var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars');
var app = express();
var http = require('http').Server(app);
var mongoose = require('mongoose');

// Twilio Keys
var accountSid = '....'; 
var authToken = '....'; 

//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken); 

// Mongo Lab keys
var MONGODB_CONNECTION_URL = '....';

//connect to database
mongoose.connect(MONGODB_CONNECTION_URL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("Database connected succesfully.");
});


//Configures the Template engine
app.engine('handlebars', handlebars({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//set environment ports and start application
app.set('port', process.env.PORT || 3000);

// Routes
require('./routes/routes')(app, client);

http.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});