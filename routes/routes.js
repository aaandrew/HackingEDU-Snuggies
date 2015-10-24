var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var models = require('../models');

// Saves a question to the DB
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
	});
};

// Saves an answer to a question
var createAnswer = function(questionId, reqAnswer, reqMessage, reqTime){
	var newAnswer = new models.Answer({
		answer_id : reqAnswer,
		message: reqMessage,
		time: reqTime
	});

	models.Question.findOne({
    question_id: questionId
   }, function(err, question) {
      if (err || !question) {
        return;
      }else{
        //update user here
        question.answers.push(newAnswer);
        question.save(function(err){
        	if(err) {
        		console.log(err);
        	} else {
        		console.log('Question: ' + newAnswer.question_id + " updated.");
        	}
        });
      }
   });
};


// Configure appplication routes
module.exports = function(app, client) {

	app.get('/', function(req, res){
		res.render('index');
	});

	app.post('/text', function(req, res){
		console.log(req.body);
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

	app.post('/answer', function(req, res){
		console.log(req.body)
		var message = req.body.Body || '';

		createAnswer('1', '1a', 'klsdjaf', 'dslkfja');
	});



};