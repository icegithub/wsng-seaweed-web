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
    mongoose.connect(dburl);
}

exports.disconnect = function(callback) {
    mongoose.disconnect(callback);
}

exports.setup = function(callback) {
    callback(null);
}
