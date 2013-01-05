/**
 * icecream
 * Default app for nodester
 * @license MIT
 */

/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

"use strict";

var fs = require('fs')
    , express = require('express')
    , engines = require('consolidate')
    , app = express()
    , http = require('http')
    , path = require('path')
    , redis = require('redis')	// 和redis连接
    , db = redis.createClient()
    , config = require('./config')
    , route = require('./route/index')
    , controller = require('./controller/index')
    ;

// 定义共享环境
app.configure(function(){
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');
    // 设置不要使用系统的layout
    app.set("view options", { layout: true });

    app.use(express.logger('dev'));
    app.use(express.compress());//gzip/deflate压缩
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
    // 接下来是纪录用户在线的中间件。 这里我们使用sorted sets, 它的一个好处是我们可以查询最近N毫秒内在线的用户。 我们通过传入一个时间戳来当作成员的"score"。 注意我们使用 User-Agent 作为一个标识用户的id
    app.use(function(req, res, next){
	var ua = req.headers['user-agent'];
	console.log("ua:", ua);
	db.zadd('online', Date.now(), ua, next);
    });
    // 下一个中间件是通过zrevrangebyscore来查询上一分钟在线用户。 我们将能得到从当前时间算起在60,000毫秒内活跃的用户。
    app.use(function(req, res, next){
	var min = 60 * 1000;
	var ago = Date.now() - min;
	db.zrevrangebyscore('online', '+inf', ago, function(err, users){
	    if(err) return next(err);
	    req.online = users;
	    next();
	});
    });
    app.use(function(req, res, next){
    	res.send(404, '::Sorry cant find that!::');
    });
})
//同时支持html的设置
// app.engine('html', engines.jqtpl);

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
// app.get('/cat', function(req, res, next) {
//     res.send(req.online.length + ' users online');
// });
app.get('/cat', route.cat);
app.get('/version', function(req,res, next){
    res.writeHeader(200, {'Content-type':'application/json'});
    res.end('{"version":"'+ process.version +'"}');
})
// app.get('/connect', controller.connect);  

// app.get('*', function(req,res){
//     res.statusCode = 404;
//     res.end(':: not found ::');
// });

// 服务其关闭是关闭数据库链接
app.on('close', function(errno) {
    controller.disconnect(function(err) {
	if(err)
	    console.log(err);
	else
	    console.log("Disconnect the icecream-nodester");
    });
});

var PORT = process.env['app_port'] || 3000;
// var PORT = process.env['app_port'] || 21018;

// app.listen( PORT , function(){
http.createServer(app).listen( PORT, function(){
    // 程序启动之后链接数据库
    controller.connect();
    console.log(':: nodester :: \n\nApp listening on port %s', this.address().port);
});
