var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');

// Get Incoming text messages


// Configure appplication routes
module.exports = function(app, client) {

	app.get('/', function(req, res){
		res.render('index');
	});

	app.post('/text', function(req, res){
		var phone = req.body.From;
		var msg = req.body.Body || '';

		console.log("Messages", req.body);
		console.log("Messages", req.body.From);
		console.log("Messages", req.body.Body);

		// client.messages.create({ 
		// 	to: "6192071673", 
		// 	from: "+16198252456",
		// 	body: req.body
		// }, function(err, message) { 
		// 	console.log(message); 
		// });
	});



};