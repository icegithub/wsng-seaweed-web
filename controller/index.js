/**
 * icecream
 * Default app for nodester
 * @license MIT
 */

/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

//Controller
"use strict";

var config = require('../config')
, db = require('../utility/mongodb')
, mysql = require('../utility/mysqlDB');


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
    check: function(req, res, next) {
				// console.log("Here is check login");
				// console.log(req.body);
				var email = req.body.email
				, password = req.body.password;
				// res.render("manage.jade");
				// if(email && password) {
				//     mysql.loginCheck(email, password, function(err, data) {
				// 	console.log("password", password);
				// 	console.log("data", data[0].password);
				// 	if(err) {
				// 	    res.render("error.jade");
				// 	} else {
				// 	    if(data[0].password == password) {
				// 		res.render("manage.jade");
				// 	    } else {
				// 		res.render("error", {title: "Login Error", err: err});
				// 	    }
				// 	}
				//     });
				// } else {
				
				// }
    }
    , record: function(req, res, next) {
				var clientip = req.socket.remoteAddress;
				var xffip  = req.header('X-Forwarded-For');
				var userip = xffip ? xffip : clientip;
				//console.log("[in controller]", userip);
				if(!userip)
						userip = "unkonow";
				db.login.record(userip, function(err) {
						if(err) {
								res.send(err);
						} else {
								res.render('showIP');
						}
				});
    }
    , findAll: function(req, res, next) {
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
