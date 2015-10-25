var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');


var questionSchema = mongoose.Schema({
	question_id : { type: String },
	answers: [],
	phone: { type: String },
	time: { type: Date, default: Date.now },
	time_count: { type: Number, default: 0 }
});

var answerSchema = mongoose.Schema({
	answer_id : { type: String },
	message: { type: String },
	time: { type: Date, default: Date.now },
	time_count: { type: Number, default: 0 }
});


exports.Question = mongoose.model('Question', questionSchema);
exports.Answer = mongoose.model('Answer', answerSchema);