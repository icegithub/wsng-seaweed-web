/**
 * icecream
 * Default app for nodester
 * @license MIT
 */

/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

"use strict";

var config = require('../config');
var db = require('../utility/mongodb');

exports.connect = function(req, res, next) {
    db.connect();
    // res.end("Successful");
    // db.disconnect();
};

exports.disconnect = function(req, res, next) {
    db.disconnect();
    res.end();
};

var login = {
    record: function(req, res, next) {
	var clientip = req.socket.remoteAddress;
	var xffip  = req.header('X-Forwarded-For');
	var userip = xffip ? xffip : clientip;
	console.log("[in controller]", userip);
	if(!userip)
	    userip = "unkonow";
	db.login.record(userip, function(err) {
	    if(err) {
		res.send(err);
	    } else {
		res.render('index');
	    }
	});
    },
    findAll: function(req, res, next) {
	db.login.findAll(function(err, docs) {
	    if(err)
		res.send(err);
	    else {
		res.send(docs);
	    }
	});
    }
};

// 提供外接口
exports.login = login;
