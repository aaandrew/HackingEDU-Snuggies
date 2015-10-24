var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');

// Configure appplication routes
module.exports = function(app, client) {

	app.get('/', function(req, res){
		res.render('index');
	});

	app.post('/text', function(req, res){
		console.log("Messages", client);
		client.messages.create({ 
			to: "6192071673", 
			from: "+16198252456",
			body: "hello"
		}, function(err, message) { 
			console.log(message); 
		});
	});

};