var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');

var accountSid = 'AC26cb71dc2a40afa318f862736cfdd55d'; 
var authToken = 'c5d316ef81b868867e706c3a29211f70'; 

//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken); 

// Configure appplication routes
module.exports = function(app, client) {

	app.get('/', function(req, res){
		res.render('index');
	});

	app.post('/text', function(req, res){
		client.messages.create({ 
			to: "6192071673", 
			from: "+16198252456",
			body: "hello"
		}, function(err, message) { 
			console.log(message); 
		});
	});

};