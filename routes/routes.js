var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var models = require('../models');

var STACK_ACCESS_TOKEN = 'wKyP96EISkn6rXshtjVxVQ))';
var STACK_KEY = 'efqKQOx8J*GTOI1*6hs0KA((';

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

// Posts question to stack overflow
var postQuestionToStack = function(title, message, tags, callback){
	console.log("posting", message);

	var data = {
		title: title,
		body: message,
		tags: tags,
		key: STACK_KEY,
		access_token: STACK_ACCESS_TOKEN,
		preview: 'true',
		filter: 'default',
		site: 'stackoverflow'
	};

	request.post({url: 'https://api.stackexchange.com/2.2/questions/add', form: data, gzip: true},
		function (error, response, body) {
			var responseObj = JSON.parse(body);
			if (!error && response.statusCode == 200) {
	    	console.log(responseObj);
	    	callback("Question successfully created!")
	  	}else{
	  		// Send error back to phone
	  		console.log(responseObj.error_message);
	  		callback(responseObj.error_message);
	  	}
	})
};

// Sends a twilio text to the specified phone number
var sendTwilioText = function(client, receiver, text){
	client.messages.create({ 
		to: receiver, 
		from: "+16198252456",
		body: text
	}, function(err, message) { 
		console.log(message); 
	});
};



// Configure appplication routes
module.exports = function(app, client) {

	app.get('/', function(req, res){
		res.render('index');
	});

	app.get('/cquestion', function(req,res){
		var title = "Difference between public, static, and final";
		//var message = "What is the difference between public, static, and final in java? I've tried looking it up on multiple sources, but have had no luck.";
		var message = "something";
		var tags = 'java';
		postQuestionToStack(title, message, tags, function(dataResponse){
			console.log('here', dataResponse);
			sendTwilioText(client,phone, dataResponse);
		});
	});

	app.post('/text', function(req, res){
		console.log(req.body);
		var phone = req.body.From;
		var message = req.body.Body || '';

		console.log("Messages", phone);
		console.log("Messages", message);

		// Save question to DB
		createQuestion(phone, message);

		// Post question to stack overflow
		var arrMessages = message.split("---");
		var title = arrMessages[0].trim();
		var text = arrMessages[1].trim();
		var tags = arrMessages[2].trim();
		postQuestionToStack(title, text, tags, function(dataResponse){
			console.log('here', dataResponse);
			sendTwilioText(client,phone, dataResponse);
		});
	});

	app.post('/answer', function(req, res){
		console.log(req.body)
		var message = req.body.Body || '';

		createAnswer('1', '1a', 'klsdjaf', 'dslkfja');
	});

	app.post("/create",function(req,res){
		var text = req.body.text.toLowerCase();
		console.log(text);
		var sentances = text.split("? ");
		//title = first sentance
		var title = sentances[0] + "?";
		//body = rest of text
		var body;
		if (sentances.length > 2) {
			body = sentances.slice(1,text.split(1,sentances.length));
		}
		else {
			body = sentances[1];
		}
		//tag = most commonly used word
		var tags = mostCommonWords(text.split(" "));
		var question = {
			"title": title,
			"body": body,
			"tags": tags
		}
		console.log(sentances);
		console.log(question);
	});
};

function mostCommonWords (words) {
	var wordAmounts = {};
	var highestNumber = 0;
	var mostCommon = [];

	var commonWords = ["i","me","why","can't","it","you"];

	for (var i = 0; i < words.length; i++) {
		var word = words[i];
		if (wordAmounts.hasOwnProperty(word)) {
			wordAmounts[word]++;
			if (wordAmounts[word] > highestNumber) {
				highestNumber = wordAmounts[word];
			}
		}
		else {
			wordAmounts[word] = 1;
			if (highestNumber === 0) {
				highestNumber = 1;
			}
		}
	}
	for (word in wordAmounts) {
		if (wordAmounts[word] == highestNumber && !(inArray(word,commonWords))) {
			mostCommon.push(word);
		}
	}
	return mostCommon;
}

function inArray(needle,haystack)
{
    var count=haystack.length;
    for(var i=0;i<count;i++)
    {
        if(haystack[i]===needle){return true;}
    }
    return false;
}





