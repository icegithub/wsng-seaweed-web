/**
 * icecream
 * Default app for nodester
 * @license MIT
 */

/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

"use strict";

var util = require('util');
var mongoose = require('mongoose');
var dburl = require("../config").mongodb;

var Schema = mongoose.Schema;

exports.connect = function(callback) {
    mongoose.connect(dburl);	// 只使用一个数据库
}
exports.disconnect = function(callback) {
    mongoose.disconnect(callback);
}
exports.setup = function(callback) {
    callback(null);
}

//定义loginSchema对象模型
var loginSchema = new Schema({
    userIp:String
    , loginTime:{type:Date,default: new Date()}
});

//访问loginSchema对象模型
mongoose.model('login_info', loginSchema);
var Login = mongoose.model('login_info');
var login = {
    record: function(userIp,callback) {
	if(userIp) {
	    console.log("[in utility]", userIp);
	    var newLogin = new Login();
	    newLogin.userIp = userIp;
	    newLogin.loginTime = new Date();
	    console.log(new Date());
	    newLogin.save(function(err){
		if(err){
		    util.log("FATAL"+err);
		    callback(err);
		}else{
		    callback(null);
		}
	    });
	}
    }, 
    findAll: function(callback) {
	// 第二个参数可以是函数
	// 完整定义
	// Model.find(conditions, [fields], [options], [callback])
	Login.find({}, function(err, docs) {
	    // 这里的docs就是查出的参数
	    // 这里使用一个回调将查出的数据出入上层
	    if(err)
		util.log('FATAL '+ err);
	    else 
		callback(err, docs);
	});
    }
};

// 对外提供接口
exports.login = login;
