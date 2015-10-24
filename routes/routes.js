var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');

var accountSid = 'AC26cb71dc2a40afa318f862736cfdd55d'; 
var authToken = 'c5d316ef81b868867e706c3a29211f70'; 

var question;

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

	app.post("/create",function(req,res){
		var text = req.body;
		var words = text.split(".");
		//title = first sentance
		var title = words[0];
		//body = rest of text
		var body = words.slice(1,text.split(1,words.length));
		//tag = most commonly used word
		var tags = mostCommonWords(text.split(" "));
		question = {
			"title": title,
			"body": body,
			"tags": tags
		}
		console.log(question);
		return question;
	});
};

function mostCommonWords (words) {
	var wordAmounts = {};
	var highestNumber = 0;
	var mostCommon = [];
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
		if (wordAmounts[word] == highestNumber) {
			mostCommon.add(word);
		}
	}
	return mostCommon;
}

