var mysql = require('../node_modules/mysql');  
var sysConf = require('../config.js');
var db = sysConf.mysqldb;
var connection = mysql.createConnection(db);

// output the basic info of database
// console.log(db);

exports.connect = function(callback) {
    connection.connect(function(err) {
	callback(err);
    });
    // console.log("++++++++++++Connect MySQL+++++++++++++++++");
};

exports.disconnect = function(callback) {
    connection.end(function(err) {
	callback(err);
    });
    // console.log("++++++++++++Disconnect MySQL+++++++++++++++++");
};

exports.handleDisconnect = function() {
    connection.on('error', function(err) {
	if (!err.fatal) {
	    return;
	}

	if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
	    throw err;
	}

	console.log('Re-connecting lost connection: ' + err.stack);

	// connection = mysql.createConnection(connection.config);
	connection = mysql.createConnection(db);
	exports.handleDisconnect(connection);
	connection.connect();
	// console.log("++++++++++++Reconnect+++++++++++++++++");
    });
}

exports.queryBasicInfo = function(tableName, callback) {
    if(tableName) {
	var cmd = 'select distinct(node_id), sense_type from ' + tableName 
	    + ' order by node_id';
	// console.log("cmd:", cmd);
	connection.query(cmd, function(err, data) {
	    callback(err, data);//Search the data to storage into the data
	});
	// console.log("++++++++++++Select+++++++++++++++++");
    }
};

exports.queryTodayCapture = function(queryCondition, callback) {
    var nodeId = queryCondition.nodeId
    , senseTime = queryCondition.senseTime
    , senseType = queryCondition.senseType;
    if(senseTime) {
    	connection.query('SELECT * FROM tb_sense WHERE sense_time >= ? ORDER BY sense_time', [senseTime], function(err, data) {
    	    callback(err, data);
    	});
    } else {
    	var err = "Query Condition is Error";
    	callback(err, null);
    }
    // if(nodeId && senseTime) {
    // 	connection.query('SELECT * FROM tb_sense WHERE node_id = ? AND sense_time >= ? ORDER BY sense_time', [nodeId, senseTime], function(err, data) {
    // 	    callback(err, data);
    // 	});
    // } else if(senseType&&senseTime) {
    // 	var cmd = 'SELECT node_id,'+senseType+', sense_time FROM tb_sense WHERE sense_time >='+senseTime+' ORDER BY sense_time';
    // 	connection.query(cmd, function(err, data) {
    // 	    callback(err, data);
    // 	});
    // } else {
    // 	var err = "Query Condition is Error";
    // 	callback(err, null);
    // }
};

exports.queryAll = function(callback) {
    connection.query('select * from tb_sense', function(err, data){
	callback(err, data);
    });
};

exports.query = function(nodeId, senseType, startTime, endTime, callback) {
    if(nodeId && senseType && startTime && endTime) {
	connection.query('select * from tb_sense where node_id = ? and sense_time >= ? and sense_time <= ? order by sense_time', 
			 [nodeId, startTime, endTime],
			 function(err, data){
			     callback(err, data);
			 });
	// connection.query('select node_id, sense_time, sense_type, ? from tb_sense where node_id = ? and sense_time >= ? and sense_time <= ? order by sense_time', 
	// 				 [senseType, nodeId, startTime, endTime],
	// 				 function(err, data){
	// 					 callback(err, data);
	// 				 });
    }
};


// 插入数据，根据数据库API
exports.addData = function(callback) {
    
};

exports.loginCheck = function(email, password, callback) {
    connection.query('select password from tb_login where email = ?', 
		     [email],
		     function(err, data){
			 callback(err, data);
		     });
}
