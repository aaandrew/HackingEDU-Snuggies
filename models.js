var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');


var questionSchema = mongoose.Schema({
	question_id : { type: String },
	answers: [],
	phone: { type: String}
});

var answerSchema = mongoose.Schema({
	answer_id : { type: String },
	message: { type: String },
	time: { type: Date}
});


exports.Question = mongoose.model('Question', questionSchema);
exports.Answer = mongoose.model('Answer', answerSchema);