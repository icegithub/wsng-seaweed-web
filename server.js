/**
 * icecream
 * Default app for nodester
 * @license MIT
 */

/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

"use strict";

var fs = require('fs')
    , express = require('express')
    , path = require('path')
    , config = require('./config')
    , route = require('./route/index')
    , controller = require('./controller/index')
    , app = express.createServer()
    ;

// 定义共享环境
app.configure(function(){
    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    // 设置不要使用系统的layout
    // app.set("view options", { layout: false });

    app.use(express.logger('dev'));
    app.use(express.compress());//gzip/deflate压缩
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    // app.use(express.static(__dirname + '/public'));
    app.use(express.static('./public'));
    app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
    // app.use(function(req, res, next){
    // 	res.send(404, 'Sorry cant find that!');
    // });
})
//同时支持html的设置
// app.register('html', require('ejs')); 

// 定义开发环境
app.configure('development', function(){
    // app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// 定义生产环境
// app.configure('production', function(){
//     var oneYear = 31557600000;
//     app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
//     app.use(express.errorHandler());
// });

// app.get('/', function(req,res){
//     fs.createReadStream(__dirname + '/index.html').pipe(res);
// });

app.get('/', route.index);
app.get('/index', route.index);
app.get('/index.html', route.index);
app.get('/index.htm', route.index);

app.get('/version', function(req,res){
    res.writeHeader(200, {'Content-type':'application/json'});
    res.end('{"version":"'+ process.version +'"}');
})
app.get('/connect', controller.connect);  

// app.get('*', function(req,res){
//     res.statusCode = 404;
//     res.end(':: not found ::');
// });

app.on('close', function(errno) {
    controller.disconnect(function(err) {
	console.log(err);
    });
});

var PORT = process.env['app_port'] || 21018;

app.listen( PORT , function(){
    console.log(':: nodester :: \n\nApp listening on port %s', this.address().port)
});
