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
				// var cmd = 'select distinct(node_id), sense_type from ' + tableName 
				var cmd = 'select distinct(node_id), sensor_id from ' + tableName + ' order by node_id';
				// console.log("cmd:", cmd);
				connection.query(cmd, function(err, data) {
						callback(err, data);//Search the data to storage into the data
				});
				// console.log("++++++++++++Select+++++++++++++++++");
    }
};

exports.queryRealTime = function(queryCondition, callback) {
    var nodeId = queryCondition.nodeId,
    senseType = queryCondition.senseType;
		connection.query('SELECT data, insert_time FROM tb_realtime_data WHERE node_id=? and sensor_id=?', [nodeId, senseType], function(err, data) {
				callback(err, data);
		});
};

exports.queryTodayCapture = function(queryCondition, callback) {
    var nodeId = queryCondition.nodeId,
    senseTime = queryCondition.senseTime,
    senseType = queryCondition.senseType;
    if(senseTime) {
				// connection.query('SELECT * FROM tb_sense WHERE sense_time >= ? ORDER BY 
				connection.query('SELECT data, insert_time FROM tb_realtime_data WHERE node_id=? and sensor_id=? and insert_time >= ? ORDER BY insert_time', [nodeId, senseType, senseTime], function(err, data) {
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
    // connection.query('select * from tb_sense', function(err, data){
		connection.query('select * from tb_history_data order by insert_time desc limit 4000', function(err, data){
				// console.log(data);
				callback(err, data);
    });
};

exports.query = function(nodeId, senseType, startTime, endTime, callback) {
    if(nodeId && senseType && startTime && endTime) {
				// connection.query('select * from tb_sense where node_id = ? and sense_time >= ? and sense_time <= ? order by sense_time', 
				connection.query('select * from tb_history_data where node_id = ? and sensor_id=? and insert_time >= ? and insert_time <= ? order by insert_time desc limit 4000', [nodeId, senseType, startTime, endTime],function(err, data){
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
    connection.query('select password from tb_login where email = ?', [email],function(err, data){
				callback(err, data);
		});
};

var Paese = {
		divide: function(data) {
				// 在外面已经判断数据长度超过1000
				if(!data) return;
				var length = data.length;
				if(length - 2 < 1000) {
						data[2] = data[1];
						data.shift();
						return data;
				}
				var head = data[0],
				tail = data[data.length - 1];
				function _divide(data, num) {
						
				}
				var n = 0;		// 分频系数
				var tNum = 0;		// 不能被整除余下的数
				var ret = [];
				if (length % 1000) {
						n = length / 1000;
				} else {
						n = length / 1000 + 1;
						tNum = length % 1000;
				}
		},
		decomposition: function(data, num) {
				num = num || 1000;
				var len = data.length;
				var head = data[0];
				var tail = data[len-1];
				var n = Math.round(len / num) + 1;	// 得到分频系数
				var lastLen = n * Math.round((len / n));
				// console.log(lastLen);
				var rNum = len - lastLen; // 得到剩余的数remainder
				var ret = this.compression(data.slice(0, lastLen - 1), n);
				ret.unshift(head);
				ret.push(tail);
				return ret;
		},
		compression: function(data, n) {
				var ret = [];
				// console.log(data);
				// console.log(n);
				for (var i in data) {
						// var newData = data.splice(n); //此时newData是data截取n长度剩下的，data此时的长度为n
						var sum = 0;
						var time = 0;
						var middle = Math.round(n/2);
						for (var j = 0; j < n; j++) {
								sum += data.shift().y;
								if (j === middle)
										time = data[j].x;
						}
						var avg = sum / n;
						ret.push({x: time, y: avg});	// 可能这里的x需要进一步分析
				}
				return ret;
		},
		xyToArray: function(data) {
				if(!data) return;
				var ret = [];
				for (var i in data) {
						var t = [];
						var v = data[i];
						t.push(v.x);
						t.push(v.y);
						ret.push(t);
				}
				return ret;
		}
};
