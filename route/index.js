
/**
 * icecream
 * Default app for nodester
 * @license MIT
 */

/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

"use strict"

var config = require('../config');
var controller = require('../controller/index');

exports.index = function(req, res, next) {
    controller.login.record(req, res, next);
    // res.render('index', {condition: false, name: "icecream", email: "creamidea[at]gmail.com"});
};

exports.cat = function(req, res, next) {
    controller.login.findAll(req, res, next);
};
