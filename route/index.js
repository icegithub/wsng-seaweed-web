
/**
 * icecream
 * Default app for nodester
 * @license MIT
 */

/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

"use strict"


///////////////////////////////////////////////////////////////////
//   Global variable 
///////////////////////////////////////////////////////////////////
var config = require('../config');
var controller = require('../controller/index');

///////////////////////////////////////////////////////////////////
//   My SQL 
///////////////////////////////////////////////////////////////////
var mysqlDB = require("../utility/mysqlDB.js")
, util = require('util')
, url = require('url');


exports.index = function(req, res, next) {
    mysqlDB.queryBasicInfo("tb_sense", function(err, data) {
	if (err) {
	    res.render('error', { title: 'Error', err: err });
	} else {
	    // console.log(data);
	    // var nodeIdSet=['1', '2', '3'];
	    res.render('index', { nodes: data });
	    // var nodes = [
	    // 	{nodeId: 1, sensors: ["温度", "湿度"]},
	    // 	{nodeId: 2, sensors: ["温度", "光照"]},
	    // 	{nodeId: 3, sensors: ["温度", "流速"]}
	    // 			];
	    // res.render('index', {nodes: nodes});
	}
    });
    // res.render('index', {condition: false, name: "icecream", email: "creamidea[at]gmail.com"});
};

exports.cat = function(req, res, next) {
    controller.login.findAll(req, res, next);
};

exports.classfee = function(req, res, next) {
    res.render('classfee');
}

exports.showIP = function(req, res, next) {
    controller.login.record(req, res, next);
    // res.render('index', {condition: false, name: "icecream", email: "creamidea[at]gmail.com"});
};

exports.todo = function(req, res, next) {
    // controller.login.findAll(req, res, next);
    res.render('todo');
};

exports.login = function(req, res, next) {
    res.send("Test");
    // controller.login.check(req, res, next);
};

exports.createQR = function(req, res, next) {
    res.render("createQR");
    // controller.login.check(req, res, next);
};

exports.tableShow = function(req, res, next) {
    // controller.login.findAll(req, res, next);
    mysqlDB.queryAll(function(err, data){
	if(err){
	    throw err;
	}
	// console.log(data);
	res.render('tableShow', {data: data});
    });
};


///////////////////////////////////////////////////////////////////
//   My SQL 
///////////////////////////////////////////////////////////////////
exports.connect = function(callback){
    mysqlDB.connect(function(err) {
	if(err) {
	    console.log("Connect MySQL Fail: ", err);
	    util.log("Connect MySQL Fail: ", err);
	    exports.disconnect(); //One connect failed, disconnect
	}
	callback();
    });
};
exports.handleDisconnect = function() {
    mysqlDB.handleDisconnect();
};
exports.disconnect = function(callback) {
    mysqlDB.disconnect(function(err) {
	if(err) {
	    console.log("Discnnect MySQL Fail: ", err);
	    util.log("Disconnect MySQL Fail: ", err);
	}	
	callback();
    });
};
// exports.index = function(req, res) {
//     mysqlDB.queryBasicInfo("tb_sense", function(err, data) {
// 		if (err) {
// 			res.render('error', { title: 'Error', err: err });
// 		} else {
// 			console.log(data);
//             // var nodeIdSet=['1', '2', '3'];
//             res.render('index', { nodeSet: data });
// 		}
//     });
// };
exports.queryTodayCapture = function(req, res) {
    // console.log("Today: ", new Date());
    // console.log("nodeId: ", req.query["nodeId"]);
    // console.log("senseTime: ", req.query["senseTime"]);
    // console.log("senseType: ", req.query["senseType"]);
    var nodeId = req.query["nodeId"] || null
    , senseTime = req.query["senseTime"] || null
    , senseType = req.query["senseType"] || null;
    // console.log("Hello, icecream");
    var queryCondition = {
	nodeId: nodeId,
	senseTime: senseTime,
	senseType: senseType
    };
    mysqlDB.queryTodayCapture(queryCondition, function(err, data) {
	if(err) {
	    console.log(err);
	    res.render('error', { title: 'Error', err: err });
	} else {
	    // console.log(data);
	    res.send(data);
	}
    });
    // if(nodeId&&senseTime) {
    // 	console.log("Query...");
    // 	// mysqlDB.queryTodayCapture(nodeId, senseTime, function(err, data) {
    // 	mysqlDB.queryTodayCapture(queryCondition, function(err, data) {
    // 	    if(err) {
    // 		console.log(err);
    // 		res.render('error', { title: 'Error', err: err });
    // 	    }
    // 	    console.log(data);
    // 	    res.send(data);
    // 	});
    // } else if(senseTime&&senseType) {
    // 	console.log("Query...");
    // 	mysqlDB.queryTodayCapture(queryCondition, function(err, data) {
    // 	    if(err) {
    // 		console.log(err);
    // 		res.render('error', { title: 'Error', err: err });
    // 	    }
    // 	    console.log(data);
    // 	    res.send(data);
    // 	});
    // }else {
    // 	res.end();
    // }
};
exports.query = function(req, res) {
    var nodeId = req.body.nodeId
    , senseType = req.body.senseType
    , startTime = req.body.startTime
    , endTime = req.body.endTime;
    // console.log(req);
    var msg = "Post successful!\n";
    msg += nodeId+"\n";
    msg += senseType+"\n";
    msg += startTime+"\n";
    msg += endTime+"\n";
    // console.log(msg);
    // nodeId = 1;
    //senseType = "temperature";
    // startTime = '20121201000000';
    // endTime = '20121212000000';
    if(nodeId && senseType && startTime && endTime) {
	mysqlDB.query(nodeId, senseType, startTime, endTime, function(err, data) {
	    // console.log(data);
	    res.send(data);
	});
    } else {
	res.end();
    }
};
exports.download = function(req, res) {
    // console.log("res:", res);
    // var msg = "icecream is ice and cream!\nice and cream is icecream";
    var msg = ""
    , nodeId = req.body.nodeId
    , senseType = req.body.senseType
    , startTime = req.body.startTime
    , endTime = req.body.endTime
    ;
    // mysqlDB.query(nodeId, senseType, startTime, endTime, function(err, data){
    mysqlDB.queryAll(function(err, data){
	if(err){
	    throw err;
	}
	// for(var key in data[0]) {
	//     if(key != "sense_time")
	// 	msg += key+" ";
	//     else
	// 	msg += ""
	// }
	msg = "节点号\t采集时间(m/d/y h:m)\t传感器类型\t光照传感器(lux)\t温度传感器(°C)\t浊度传感器(ntu)\t流速传感器(m/s)\r\n"
	for(var i in data) {
	    msg += data[i].node_id + "\t";
	    // msg += data[i].sense_time.toISOString().slice(0, 19)+" ";
	    msg += newDateToString(data[i].sense_time)+"\t";
	    // replace(/\s+/g, "-")
	    msg += data[i].sense_type+"\t";
	    msg += data[i].light+"\t";
	    msg += data[i].temperature+"\t";
	    msg += data[i].turbidity+"\t";
	    msg += data[i].flowspeed+"\t";
	    msg += "\r\n";
	}
	var length = msg.length;
	var header = {
	    'Content-Description':'File Transfer', 
	    // 'Content-Type':'application/vnd.ms-excel',
	    // 'Content-Type': 'application/force-download',
	    // 'Content-Type': 'application/octet-stream',
	    // 'Content-Type': 'application/download',
	    'Content-Type':'html/text',
	    'Content-Disposition':'attachment;filename=所有采集数据.txt',
	    'Content-Transfer-Encoding':'utf-8',
	    'Expires': 0,
	    'Cache-Control': 'must-revalidate,post-check=0,pre-check=0',
	    'Pragma': 'public',
	    'Content-Length': length.toString()
	};
	res.writeHead(200, header);
	// res.setHeader(header);
	// console.log(data);
	res.end(msg);
    });
};


// private function: 
//将使用new Date()或者说是一个时间对象创建的时间转为20101010020304的时间格式
function newDateToString (time) {
    var month=new Array(12);
    month[0]="01";
    month[1]="02";
    month[2]="03";
    month[3]="04";
    month[4]="05";
    month[5]="06";
    month[6]="07";
    month[7]="08";
    month[8]="09";
    month[9]="10";
    month[10]="11";
    month[11]="12";
    var y = time.getFullYear(),
    mon = month[time.getMonth()],
    d = time.getDate()<10?'0'+time.getDate():time.getDate(),
    h = time.getHours()<10?'0'+time.getHours():time.getHours(),
    min = time.getMinutes()<10?'0'+time.getMinutes():time.getMinutes(),
    s = time.getSeconds()<10?'0'+time.getSeconds():time.getSeconds(),
    t = y+"-"+mon+"-"+d+" "+h+":"+min+":"+s;
    return t;
};

//////////////////////////////////////////////////////////////////////
exports.addData = function () {};
