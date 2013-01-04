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
    res.end("Successful");
    db.disconnect();
}

exports.disconnect = function(req, res, next) {
    db.disconnect();
    res.end();
}
