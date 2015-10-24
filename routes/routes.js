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


var question;


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
		question = {
			"title": title,
			"body": body,
			"tags": tags
		}
		console.log(sentances);
		console.log(question);
		return question;
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





