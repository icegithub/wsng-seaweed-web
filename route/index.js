/**
 * icecream
 * Default app for nodester
 * @license MIT
 */

/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

"use strict"

var config = require('../config');

exports.index = function(req, res, next) {
    res.render('index');
}
