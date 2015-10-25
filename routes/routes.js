var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var models = require('../models');

var STACK_ACCESS_TOKEN = 'bMRK4shRZlU7LlTlwNXJUA))';
var STACK_KEY = 'tdN1YwerF4BEOUORE8A68w((';

// Polling constants
var timeoutDuration = 180000;

// Saves a question to the DB
var createQuestion = function(questionId, phoneNumber, timeCount){
	var newQuestion = new models.Question({
		question_id : questionId,
		answers: [],
		phone: phoneNumber,
		time_count: timeCount
	});

	newQuestion.save(function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log('Question: ' + newQuestion.question_id + " created.");
		}
	});
};

// Checks Answers array to see answer is present
var checkAnswersArrayDuplicate = function(answers, answerId){
	for(var i=0; i<answers.length; i++){
		if(answers[i].answer_id == answerId){
			return true;
		}
	}
	return false;
};

// Saves an answer to a question
var createAnswer = function(questionId, reqAnswer, reqMessage, reqTime, timeCount, callback){
	var newAnswer = new models.Answer({
		answer_id : reqAnswer,
		message: reqMessage,
		time: reqTime,
		time_count: timeCount
	});

	models.Question.findOne({
    question_id: questionId
   }, function(err, question) {
      if (err || !question) {
        return;
      }else{
        if(!checkAnswersArrayDuplicate(question.answers, reqAnswer)){
        	// Answer not found so push to questions array
        	// Save to DB
        	question.answers.push(newAnswer);
        	question.save(function(err){
        		if(err) {
        			console.log(err);
        		} else {
        			console.log('Question: ' + questionId + " updated.");
        		}
        	});
        	// Send twilio text
        	callback(question.phone, reqMessage);
        }
      }
   });
};

// Posts question to stack overflow
var postQuestionToStack = function(title, message, tags, phone, callback){
	console.log("posting", message);

	var data = {
		title: title,
		body: message,
		tags: tags,
		key: STACK_KEY,
		access_token: STACK_ACCESS_TOKEN,
		//preview: 'true',
		filter: 'default',
		site: 'stackoverflow'
	};

	request.post({url: 'https://api.stackexchange.com/2.2/questions/add', form: data, gzip: true},
		function (error, response, body) {
			var responseObj = JSON.parse(body);
			if (!error && response.statusCode == 200) {	    	
	    	// Save question to DB
	    	createQuestion(responseObj.items[0].question_id, phone, "1");

	    	callback("Question successfully created!")
	  	}else{
	  		// Send error back to phone
	  		console.log(responseObj.error_message);
	  		callback(responseObj.error_message);
	  	}
	});
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

// Remove HTML tags from text
var removeHTMLTags = function(text){
	var regex = /(<([^>]+)>)/ig;
	// Remove HTML Tags
	var result = text.replace(regex, "");
	// Remove new lines
	return result.replace(/(\r\n|\n|\r)/gm, " ");
};

var pollQuestion = function(questionId, client){
	var prevUrl = 'https://api.stackexchange.com/2.2/questions/';
	var endUrl = '/answers?order=desc&sort=activity&site=stackoverflow&filter=withbody';

	var url = prevUrl + questionId + endUrl;

	console.log('requesting', url);

	request({url: url, gzip: true}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var responseObj = JSON.parse(body);

			// Add all answers to database
			responseObj.items.forEach(function(item){
				var strippedMessage = removeHTMLTags(item.body);
				createAnswer(item.question_id, item.answer_id, strippedMessage, item.creation_date, '1', 
					function(phoneNumber, answerMessage){
						var outputtedMessage = item.owner.display_name + ": " + answerMessage;
						sendTwilioText(client, phoneNumber, outputtedMessage);
					});
			});
		}else{
			console.log("error", error);
		}
	});
};


// Configure appplication routes
module.exports = function(app, client) {

	// Poll for new questions at1 interval duration
	var interval = setInterval(function() {
		models.Question.find({}, function(err, questions) {
			questions.forEach(function(question) {
				console.log(question.question_id);
				pollQuestion(question.question_id, client);
			});
		});
	}, timeoutDuration);

	app.get('/', function(req, res){
		res.render('index');
	});

	app.get('/getQuestions', function(req, res){
		models.Question.find({}, function(err, questions) {
			questions.forEach(function(question) {
				console.log(question.question_id);
				pollQuestion(question.question_id, client);
			});
		});
	});

	app.post('/text', function(req, res){
		console.log(req.body);
		var phone = req.body.From;
		var message = req.body.Body || '';

		// If asked for Help, send default message.
		if(message.trim().toLowerCase() == 'tutorial'){
			sendTwilioText(client, phone, "Welcome to AskOverflow! To ask a question format it as: '<Title> --- <Body> --- <Tag>', and we'll get back to you as soon as possible!");
			res.end();
			return;
		}

		console.log("Messages", phone);
		console.log("Messages", message);

		// Post question to stack overflow
		var arrMessages = message.split("---");
		if(arrMessages.length == 3){
			var title = arrMessages[0].trim();
			var text = arrMessages[1].trim();
			var tags = arrMessages[2].trim();
			postQuestionToStack(title, text, tags, phone, function(dataResponse){
				console.log('here', dataResponse);
				sendTwilioText(client, phone, dataResponse);
			});
		}else{
			sendTwilioText(client, phone, "Please format question as: <Title> --- <Body> --- <Tag>");
		}
		res.end();
	});

	app.post('/answer', function(req, res){
		console.log(req.body)
		var message = req.body.Body || '';
		createQuestion('1', '3132131', '1');
		//createAnswer('1', '1a', 'klsdjaf', 'dslkfja');
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





