var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var models = require('../models');

// Get Incoming text messages
var createQuestion = function(questionId, phoneNumber){
	var newQuestion = new models.Question({
		question_id : questionId,
		answers: [],
		phone: phoneNumber
	});

	newQuestion.save(function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log('Question: ' + newQuestion.question_id + " created.");
		}
		return done(null, newQuestion);
	});
};


// Configure appplication routes
module.exports = function(app, client) {

	app.get('/', function(req, res){
		res.render('index');
	});

	app.post('/text', function(req, res){
		var phone = req.body.From;
		var message = req.body.Body || '';

		console.log("Messages", phone);
		console.log("Messages", message);
		createQuestion(phone, message);

		// client.messages.create({ 
		// 	to: "6192071673", 
		// 	from: "+16198252456",
		// 	body: req.body
		// }, function(err, message) { 
		// 	console.log(message); 
		// });
	});



};