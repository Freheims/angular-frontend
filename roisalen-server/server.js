var restify = require('restify');
var mongojs = require("mongojs");
var Speaker = require("../roisalen-common/models/speaker");
var SpeakerQueue = require("../roisalen-common/models/speakerqueue");
var preflightEnabler = require('se7ensky-restify-preflight');

var ip_addr = '';
var port    =  process.env.PORT || '8080';
 
var server = restify.createServer({
    name : "myapp"
});


 
server.listen(port, function(){
    console.log('%s listening at %s ', server.name , server.url);
});

preflightEnabler(server);
server.use(restify.queryParser());
server.use(restify.bodyParser());

var connection_string = process.env.MONGOLAB_URI || '127.0.0.1:27017/myapp';
var db = mongojs(connection_string, ['myapp']);
var speakers = db.collection("speakers");

var speakerQueue = new SpeakerQueue();

var subject = "";

var PATH = "/speakers";


server.get({path: "/speakers", version: "0.0.1"}, getAllSpeakers);
server.get({path: "/speakers/:speakerId", version: "0.0.1"}, getSpeaker);
server.post({path: "/speakers", version: "0.0.1"}, createNewSpeaker);
server.get({path: "/speakerList", version: "0.0.1"}, getSpeakerList);
server.post({path: "/speakerList", version: "0.0.1"}, addSpeakerToList);
server.del({path: "/speakerList/:speakerRank", version: "0.0.1"}, removeSpeakerAtPoint);
server.post({path: "/speakerList/:speakerRank/replies", version: "0.0.1"}, addReplyToSpeakerAtPoint);
server.del({path: "/speakerList/:speakerRank/replies/:replyRank", version: "0.0.1"}, deleteReply);
server.post({path: "/subject", version: "0.0.1"}, setSubject);
server.get({path: "/subject", version: "0.0.1"}, getSubject);
server.post({path: "/speakerList/:speakerRank", version: "0.0.1"}, doneSpeaking )

function setSubject(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	subject = req.body;
	res.send(201);
	return next();
}

function getSubject(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.send(200, subject);
	return next();
}

function getAllSpeakers(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	speakers.find().sort({speakerId: -1}, function(err, success){
		console.log("Response success "+success);
		console.log("Response error "+err);
		if (success){
			res.send(200, success);
		} else{
			res.send(500);
			return next(err);
		}
	});
}

function getSpeaker(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	speakers.findOne({number: req.params.speakerId}, function(err, success) {
		console.log("Response success "+success);
		console.log("Response error "+err);
		if (success){
			res.send(200, success);
			return next();
		}
		res.send(500);
		return next(err);
	});
}

function createNewSpeaker(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	console.log(req.body);
	var speakerJson = JSON.parse(req.body);
	console.log(speakerJson);
	var speaker = new Speaker(speakerJson.name, speakerJson.number, speakerJson.sex, speakerJson.group);
	res.setHeader('Access-Control-Allow-Origin', '*');
	speakers.save(speaker, function(err, success) {
		console.log("Response success "+success);
		console.log('Response error '+err);
		if (success) {
			res.send(201, speaker);
			return next();
		} else {
			res.send(500);
			return next(err);
		}
	});
}

function getSpeakerList(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.send(200, speakerQueue.list);
	return next();
}

function addSpeakerToList(req, res, next) {
	console.log("adding speaker");
	res.setHeader('Access-Control-Allow-Origin', '*');
	speakers.findOne({number: req.body}, function(err, success) {
		if (success) {
			speakerQueue.add(success);
			res.send(200, speakerQueue.list);
			return next();
		}
		res.send(500);
		return next(err);
	});	
}

function addReplyToSpeakerAtPoint(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	console.log("adding reply");
	var replicantId = req.body;
	var speakerIndex = req.params.speakerRank;
	speakers.findOne({number: replicantId}, function(err, success) {
		if (success) {
			console.log("found speaker");
			console.log(speakerIndex);
			var speaker = speakerQueue.get(speakerIndex);
			speaker.replies.push(success);
			res.send(200);
			return next();
		}
		res.send(500);
		return next(err);
	});
}

function doneSpeaking(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	var speaker = speakerQueue.get(req.params.speakerRank);


}

function removeSpeakerAtPoint(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	console.log(req.params.speakerRank);
	speakerQueue.removeAt(req.params.speakerRank);
	res.send(200);
	return next();
}

function deleteReply(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	speakerQueue.get(req.params.speakerRank).replies.splice(req.params.replyRank,1);
	res.send(200);
	return next();
}

