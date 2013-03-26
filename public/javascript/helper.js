// =======================================Tiny Pub/Sub=======================================
/* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */
(function($) {
    var o = $({});
    $.subscribe = function() {
		o.on.apply(o, arguments);
    };
    $.unsubscribe = function() {
		o.off.apply(o, arguments);
    };
    $.publish = function() {
		o.trigger.apply(o, arguments);
    };
}(jQuery));
// =======================================End================================================

// ==========================================处理时间的小工具===================================
//将时间格式为2013-02-01T16:00:00.000Z转为20130201160000
//本来打算直接返回unix time但是为了保持最小代码改动量，在这里放回上述时间格式
function toTimeSerial(time)
{
	if(time) {
		var timeArray = time.match(/(\d+)/g); // 2013,02,01,16,00,00,000
		var ret = "";
		for(var i = 0, len = timeArray.length; i < len - 1; i++) {
			ret += timeArray[i];
		}
		return ret;
	}
	return null;
}

//将使用new Date()创建的时间转为20101010020304的时间格式
function newDateToString (time, fillText) {
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
    t = y+mon+d+h+min+s;
    if(!fillText) {		// 这个经常发生
		return t;
    } else {
		t2 = y+mon+d+fillText;
		return t2;
    }
}
//将时间格式为20120808101010转为UNIX时间戳
function parseToUnixTime(time) {
    // console.log("[IN MODEL]recent time: ", time);
	if(time) {
		var year = time.slice(0, 4),
		month = time.slice(4, 6),
		day = time.slice(6, 8),
		hour = time.slice(8, 10),
		minutes = time.slice(10, 12),
		seconds = time.slice(12, 14),
		t = hour+':'+minutes+':'+seconds;
		if(hour.slice(0, 1) == 0) hour = hour.slice(1);
		var nowSeconds = (parseInt(hour)*3600+parseInt(minutes)*60+parseInt(seconds)) * 1000,
		date = year+'/'+month+'/'+day;
		
		// var ret = parseInt(Date.parse(date));
		// var ret = Date.parse(date); // 这个方法IE不受用啊
		ret = new Date(date).getTime();
		var unix_time = parseInt(ret) + nowSeconds + 28800000 + 28800000; // 8个小时=28800秒,不知为何与其会相差2个8小时，感觉是时区的问题，以后再来改吧
		// 这个下面的代码救了我
		// console.log("[IN MODEL]recent t: ", t);
		// console.log("[IN MODEL]HOUR:", parseInt(hour));
		// console.log("[IN MODEL]recent date: ", date);
		// console.log("[IN MODEL]recent ret: ", ret);
		// console.log("[IN MODEL]recent Now Seconds: ", nowSeconds);
		// console.log("[IN MODEL]recent ret+nowSecondes: ", unix_time);
		return unix_time;
	}
};
// 将任何带有字母后者连字符的时间串转成20121212120000
function timeConvertToString(time) {
    if(!time)
		return null;
    if(time && time.length > 19)
		time = time.slice(0, 19);
    // console.log(time);
    time = time.replace(/\D+/g, " ");
    time = time.split(" ");
    var time2 = "";
    for(var i in time) 
		time2+=time[i]
    // console.log(time2);
    return time2;
}
// ======================================处理时间的小工具 结束===================================

// ======================================画图表的小工具========================================
// 所有信息都将传递到这个函数，由函数内部对数据进行处理

// 该函数从node中剥离出series所需要的信息，方便后面绘制图表
function getSeries(node) {
    if(node) {
		series = [];
		for(var key in node.sense) {
			series.push({name: key, data: node.sense[key]});
		}
		return series;
    }
};
// 初始化绘制图表时所需的信息选项
function chartOptInitBySenseType(info) {
    // Highcharts.setOptions({
    //     global: {
    //         useUTC: false
    //     }
    // });
    if(info) {
		console.log("info:", info);
		var renderTo = info.renderTo
		, nodeId = info.nodeId || null
		, senseType = info.senseType
		, data = info.data
		, options = info.options || "today"
        , cnName = enNameToCnName(senseType)
		, chartOption = {}
		, unit = "";
		switch(senseType) {
		case "temperature":
			unit = '°C';
			break;
		case "light":
			unit = 'lux';
			break;
		case "flowspeed":
			unit = 'm/s';
			break;
		case "turbidity":
			unit = 'ntu';
			break;
		default:
			unit = "";
			break;
		}
		chartOption.chart = {
            renderTo: renderTo,
			type: 'spline',
            // marginRight: 10,
			zoomType: 'x',
            // marginBottom: 
            events: {
                // 将自动更新（采用轮寻的方式）图表，将给图表来做
				load: function() {
                    // set up the updating of the chart each second
                    var series = this.series[0];
					var data = this.series[0].options.data;
					console.log("data: ", data);
					var lastTime = parseInt(newDateToString(new Date(data[data.length-1].x))) - 80000; // 我也不知道为何转化过去会相差8个小时，这里时间已经转成20121212080000，所以直接减去80000
					// console.log("lastTime:", parseInt(lastTime));
                    setInterval(function() {
		    			var pkt = {
		    				"nodeId": nodeId,
		    				"senseTime": lastTime
		    			};
		    			queryTodayCapture(pkt, function(msg) {
							var node = receiveDataHandler(msg, "noPublish");
							// console.log("node: ", node);
							var temp = node.sense[senseType][0]; // 拿到该传感器最新采集的数据，因为现在一次只传回一个采集数据
							// console.log("temp: ", temp.x);
							// console.log("data[data.length-1].x: ", data[data.length-1].x);
							if(temp.x !== data[data.length-1].x) {
								series.addPoint([temp.x, temp.y], true, true);
								network.node[nodeId].sense[senseType].push({x: temp.x, y: temp.y});
								console.log("Hello, icecream: ", network);
							}
						});
                    }, 3000000); // 每隔5分钟请求一次
                }
            }
		};
		chartOption.title = {
            text: cnName + '传感器采集值',
            x: -20 //center
		};
		chartOption.subtitle = {
            text: '数据来源：常熟市智胜信息技术有限公司',
            x: -20
		};
		chartOption.xAxis = {
            type: 'datetime',
            tickPixelInterval: 75
		};
		chartOption.tooltip = {
			// (this.series.name == 'Rainfall' ? ' mm' : '°C');
            formatter: function() {
				return '<b>'+ this.series.name +'</b><br/>'+
                    Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) +'<br/>'+
                    Highcharts.numberFormat(this.y, 2) + ' ' + unit;
            }
		};
		chartOption.legend = {
            enabled: true
		};
		// chartOption.exporting = {
        //     enabled: true
		// };
		chartOption.plotOptions = {
			area: {
				lineWidth: 1,
				marker: {
                    enabled: false,
                    states: {
						hover: {
                            enabled: true,
                            radius: 5
						}
                    }
				}
				// shadow: true
			}
		};
		chartOption.yAxis = { // Primary yAxis
            labels: {
				formatter: function() {
                    return this.value + unit;
				},
				style: {
                    color: '#89A54E',
					fontSize: '14px'
				}
            },
            title: {
				text: enNameToCnName(senseType),
				style: {
                    color: '#89A54E'
				}
            }
		};// , { // Secondary yAxis
        //     title: {
		// 	text: 'flowspeed',
		// 	style: {
        //             color: '#4572A7'
		// 	}
        //     },
        //     labels: {
		// 	formatter: function() {
        //             return this.value +' mm';
		// 	},
		// 	style: {
        //             color: '#4572A7'
		// 	}
        //     },
        //     opposite: true
		// }
		if(nodeId&&options == "today") {		// 说明是根据节点号绘制图标
			chartOption.series = [{
				name: enNameToCnName(senseType),
				data: data
			}];
		} else if(nodeId&&options === "history") {		// 说明是根据节点号绘制图标
			chartOption.series = [{
				name: enNameToCnName(senseType),
				data: data
			}];
		}
		if(!nodeId && options === "today"){		// 根据节点类型绘制图标
			var series = [];
			for (var i in data) { // data中存放的是传感器对应的节点号
				var nodeId = data[i];
				var node = network.node[nodeId];
				series.push({name: "节点"+node.nodeId, 
							 data: node.sense.today[senseType]});
			}
			chartOption.series = series;
		} else if(!nodeId && options === "history"){		// 根据节点类型绘制图标
			console.log("Here");
			var series = [];
			for (var i in data) { // data中存放的是传感器对应的节点号
				var nodeId = data[i];
				var node = network.node[nodeId];
				series.push({name: "节点"+node.nodeId, 
							 data: node.sense.history[senseType]});
			}
			chartOption.series = series;
		} 
		console.log("chartOptions:", chartOption);
		return chartOption;
    }
};
function drawOptions(info)
{
	// console.log("node: ", info);
    if(info) {
		// console.log("info:", info);
		var renderTo = info.renderTo
		, nodeId = info.nodeId || null
		, senseType = info.senseType
		, data = info.data
		// , options = info.options || "today"
        , cnName = enNameToCnName(senseType)
		, chartOption = {}
		, unit = "";
		switch(senseType) {
		case "temperature":
			unit = '°C';
			break;
		case "light":
			unit = 'lux';
			break;
		case "flowspeed":
			unit = 'm/s';
			break;
		case "turbidity":
			unit = 'ntu';
			break;
		default:
			unit = "";
			break;
		};
		chartOption.chart = {
            renderTo: renderTo
			, type: 'spline'
            // , marginRight: 10
			, zoomType: 'x'
            // marginBottom: 
            , events: {
                // 将自动更新（采用轮寻的方式）图表，将给图表来做
				load: function() {
                    // set up the updating of the chart each second
                    var series = this.series[0];
					var data = this.series[0].options.data;
					// console.log("data: ", data);
					var lastTime = parseInt(newDateToString(new Date(data[data.length-1].x))) - 80000; // 我也不知道为何转化过去会相差8个小时，这里时间已经转成20121212080000，所以直接减去80000
					// console.log("lastTime:", parseInt(lastTime));
                    setInterval(function() {
		    			var pkt = {
		    				"nodeId": nodeId,
		    				"senseTime": lastTime
		    			};
		    			queryTodayCapture(pkt, function(msg) {
							var node = receiveDataHandler(msg, "noPublish");
							// console.log("node: ", node);
							var temp = node.sense[senseType][0]; // 拿到该传感器最新采集的数据，因为现在一次只传回一个采集数据
							// console.log("temp: ", temp.x);
							// console.log("data[data.length-1].x: ", data[data.length-1].x);
							if(temp.x !== data[data.length-1].x) {
								series.addPoint([temp.x, temp.y], true, true);
								network.node[nodeId].sense[senseType].push({x: temp.x, y: temp.y});
								console.log("Hello, icecream: ", network);
							}
						});
                    }, 3000000); // 每隔5分钟请求一次
                }
            }					// event end
		};
		chartOption.title = {
            text: cnName + '传感器采集值',
            x: -20 //center
		};
		chartOption.subtitle = {
            text: '数据来源：常熟市智胜信息技术有限公司',
            x: -20
		};
		chartOption.xAxis = {
            type: 'datetime',
            tickPixelInterval: 75
		};
		chartOption.tooltip = {
			// (this.series.name == 'Rainfall' ? ' mm' : '°C');
            formatter: function() {
				return '<b>'+ this.series.name +'</b><br/>'+
                    Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) +'<br/>'+
                    Highcharts.numberFormat(this.y, 2) + ' ' + unit;
            }
		};
		chartOption.legend = {
            enabled: false
		};
		// chartOption.exporting = {
        //     enabled: true
		// };
		chartOption.plotOptions = {
			spline: {			// 这样写就去掉了那些点，变成光滑的曲线
				lineWidth: 1,
				marker: {
                    enabled: false,
                    states: {
						hover: {
                            enabled: true,
                            radius: 0
						}
                    }
				},
				shadow: true
			}
		};
		chartOption.yAxis = { // Primary yAxis
            labels: {
				formatter: function() {
                    return this.value + unit;
				},
				style: {
                    color: '#89A54E',
					fontSize: '14px'
				}
            },
            title: {
				text: enNameToCnName(senseType),
				style: {
                    color: '#89A54E'
				}
            }
		};
		// for (var i in data) {
		// 	data[i].x = parseInt(data[i].x);
		// 	console.log(data[i].x, ":", data[i].y);
		// }
		// data = [
		// 	{x: 1359763200000, y: 1}
		// 	, {x: 1359765000000, y: 2}
		// ];
		// for (var i in data) {
		// 	data[i].x = parseInt(data[i].x);
		// 	console.log(data[i].x, ":", data[i].y);
		// }
		// console.log(data);
		chartOption.series = [{
			name: enNameToCnName(senseType),
			data: data
		}];
		return chartOption;
	}
}
function drawChartByNodeId(info) {
    if(info){
		console.log("info:", info);
		var node = info.node
		, tabId = info.tabId
		, nodeId = node.nodeId
		, options = info.options || "today"
		, sense = node.sense;
		for( var ckey in charts) {
			// if( ckey != divId ) {
			// 如果不将图表中原有的数据清除，那么会收到历史查询数据的影响。偷懒的方法，全部清空
			// charts[ckey].options.series = [];
			// charts[ckey].series = [];
			$('#'+ckey).addClass("hide");
			// console.log("ckey: ", ckey);
			// }
		}
		for(var key in sense) {
			// 这里需要处理一下上次绘制留下的多余的div，我准备将其隐藏
			// 如果实在太麻烦了，那就将其全部删除，全部重建
			// 我现在的处理是将其先全部隐藏，然后在逐个显示
			var divId = createChartArea(tabId, key);
			if(!divId) {	// 如果divId为假的话，说明没有创建，这么说明已经存在，所以可以直接命名divId
				divId = createChartAreaDivId(tabId, key);
			}
			for(var ckey in charts) {
				if( ckey == divId ) {
					$('#'+ckey).removeClass("hide");
				}
			}
			// console.log(divId);
			var info = {
				"nodeId": nodeId, // 后面图表自身更新需要这个
				"renderTo": divId,
				"senseType": key,
				"data": node.sense[options][key]
			}
			var chartOpt = chartOptInitBySenseType(info);
    	    // chartOpt.chart.renderTo = divId;
			// chartOpt.series = [{name: key, data: node.sense[key]}];
			// series.push({name: key, data: node.sense[key]});
			// console.log("series:", chartOpt.series);
			if(tabId == 2) 
				chartOpt.chart.type = "area";
			// 存入全局的charts对象，管理所有的绘制图表
			charts[divId] = new Highcharts.Chart(chartOpt);
			// console.log("charts", charts);
		}
    }
};
function drawChartBySenseType(senseType) {
    if(senseType) {
		console.log(charts);
    }
};
function drawChart(info) {
    if(info){
		var msg = info.msg
		  , options = info.options || "today";
		// console.log("info:", info);
		// 绘制图表前的准备，将绘制区全部隐藏
		for( var ckey in charts) {
			// 如果不将图表中原有的数据清除，那么会收到历史查询数据的影响。偷懒的方法，全部清空
			// charts[ckey].options.series = [];
			// charts[ckey].series = [];
			$('#'+ckey).addClass("hide");
		}
		if(!isNaN(msg)){	// 如果传入的是节点号
			// console.log("Number");
			var nodeId = msg,
			sense = network.node[nodeId].sense;
			for(var key in sense[options]) {
				// 这里需要处理一下上次绘制留下的多余的div，我准备将其隐藏
				// 如果实在太麻烦了，那就将其全部删除，全部重建
				// 我现在的处理是将其先全部隐藏，然后在逐个显示
				var divId = createChartArea(tabId, key);
				if(!divId) {	// 如果divId为假的话，说明没有创建，这么说明已经存在，所以可以直接命名divId
					divId = createChartAreaDivId(tabId, key);
				}
				for(var ckey in charts) {
					if( ckey == divId ) {
						// console.log(charts[ckey]);
						$('#'+ckey).removeClass("hide");
					}
				}
				// console.log(divId);
				var info = {
					"nodeId": nodeId, // 后面图表自身更新需要这个
					"renderTo": divId,
					"senseType": key,
					"data": network.node[nodeId].sense[options][key],
					"options": options
				}
				console.log("key:", key);
				console.log("info.data:", network.node[nodeId].sense[options][key]);
				var chartOpt = chartOptInitBySenseType(info);
    			// chartOpt.chart.renderTo = divId;
				// chartOpt.series = [{name: key, data: node.sense[key]}];
				// series.push({name: key, data: node.sense[key]});
				// console.log("series:", chartOpt.series);
				if(tabId == 2) 
					chartOpt.chart.type = "area";
				// 存入全局的charts对象，管理所有的绘制图表
				charts[divId] = new Highcharts.Chart(chartOpt);
				// console.log("charts", charts);
			}
		} else {
			// console.log("String");
			var senseType = msg;
			sense = network.sense[senseType]; // 存放的是传感器对应节点的数组
			// 这里需要处理一下上次绘制留下的多余的div，我准备将其隐藏
			// 我现在的处理是将其先全部隐藏，然后在逐个显示
			var divId = createChartArea(tabId, senseType);
			if(!divId) {	// 如果divId为假的话，说明没有创建，这么说明已经存在，所以可以直接命名divId
				divId = createChartAreaDivId(tabId, senseType);
			}
			for(var ckey in charts) {
				if( ckey == divId ) {
					$('#'+ckey).removeClass("hide");
				}
			}
			var info = {
				"nodeId": nodeId, // 后面图表自身更新需要这个
				"renderTo": divId,
				"senseType": senseType,
				"data": sense,
				"options": options
			}
			var chartOpt = chartOptInitBySenseType(info);
    	    // chartOpt.chart.renderTo = divId;
			// chartOpt.series = [{name: key, data: node.sense[key]}];
			// series.push({name: key, data: node.sense[key]});
			// console.log("series:", chartOpt.series);
			if(tabId == 2) 
				chartOpt.chart.type = "area";
			// 存入全局的charts对象，管理所有的绘制图表
			charts[divId] = new Highcharts.Chart(chartOpt);
			// console.log("charts", charts);
		}
    }
};
// ======================================画图表的小工具 结束========================================


// ======================================节点信息处理小工具========================================
// 将传感器编号转化为相应的字符串,以数组的形式返回
function codeToString (code) {
    // console.log("code: ", code);
    if(parseInt(code)) {
		var ret = [];
		switch (parseInt(code)) {
		case 1:
			// ret.push("light");

			//修改的地方 2013-03-26
			ret.push("temperature");
			ret.push("turbidity");
			ret.push("flowspeed");
			break;
		case 12:
			ret.push("temperature");
			ret.push("turbidity");
			break;
		case 10:
			ret.push("temperature");
			ret.push("flowspeed");
			break;
		default:
			break;
		}
		return ret;
    } else {
		return null;
	}
};
// 将英文名转换成中文名
function enNameToCnName(enName){
    var ret = null;
	if (enName) {
		switch (enName) {
		case 'temperature':
			ret = "温度";
			break;
		case 'light':
			ret = "光照";
			break;
		case 'flowspeed':
			ret = "流速";
			break;
		case 'turbidity':
			ret = "浊度";
			break;
		default:
			break;
		}
	}
    return ret;
};
// 生成一个查询当日数据的消息包
function generateToday() {
    var time = newDateToString(new Date(), "000000");
    data = {
		// "senseTime": "20130202000000"
		"senseTime": time
    };
    return data;
};
// 请求当天的采集数据
function queryTodayCapture(data, callback) {
    $.ajax({
		type: "GET",
		url: "/queryTodayCapture",
		async:false,
		data: data
    }).success(function(data) {
		// console.log("Data: ", data);
		if(data) {
			callback(data);
		}
    });
};
// 比较是否存在（这里特指某一个传感器，用Sense代替）
// 如果不存在返回false，存在返回相应的在数值中的索引
function isExistByNodeId(nodeId, sense)
{
    // console.log("nodeId:", nodeId);
    // console.log("sense:", sense);
    // 这里的sense是一个数组
    if(nodeId && (sense.length>0)) {
		var i = 0;
		for(i = 0; i < sense.length; i++) {
			if(nodeId === sense[i]){ // 如果存在
				return true;
			}
		}
		return false;
    } else {
		return false;
    }
}
// 将收到的信息进行处理
function receiveDataHandler(msg, isHistory) {
    // console.log("msg", msg);
    // console.log("new Date : sense_time", newDateToString(new Date(msg[0].sense_time)));
    // console.log("msg", toTimeSerial(msg[0].sense_time));
    if(msg && (msg.length > 0)) {
		// 这个是我先前的想法
    	// 这里已经知道是那个节点了，只要将数据存入对应的存储单元即可
    	// 也就是说该节点的节点号和所拥有的传感器类型都已经知道了
    	// network.node["node"+nodeId].senseType = msg[0].sense_type; 
    	// 根据传感器类型编号拿到相应的字段，创建数组，存取采集值
		// 现在的想法：
		// 我就是一开始拿到今天所有节点所有传感器的采集值
		// console.log("Start analysis...");
		for(var i in network.node)
			if("sense" in network.node[i])
				for(var key in network.node[i].sense.history){
					network.node[i].sense.history[key] = [];
				}
		for(var i in msg) {
			var nodeId = msg[i].node_id;  // 先拿到该节点的ID
			if( nodeId in network.node) { // 该节点已经存在网络中
				var senseType = codeToString(msg[i].sense_type);
    			var senseTime = parseToUnixTime(toTimeSerial(msg[i].sense_time));
    			// var sneseTime = parseToUnixTime(newDateToString(new Date(msg[i].sense_time)));
    			for(var j in senseType) {
					if(isHistory) {
						// console.log("senseType[j]", senseType[j]);
						if( !(senseType[j] in network.node[nodeId].sense.history) ) {
							network.node[nodeId].sense.history[senseType[j]] = [];
    					}
    					network.node[nodeId].sense.history[senseType[j]]
							.push({"x": parseInt(senseTime), "y": parseFloat(msg[i][senseType[j]])});
					} else {
    					// 因为我这里将传感器的名字存在数组中，所以要获得传感器名字，则需要senseType[j]
						if( !(senseType[j] in network.node[nodeId].sense.today) ) {
    						network.node[nodeId].sense.today[senseType[j]] = [];
						}
    					network.node[nodeId].sense.today[senseType[j]]
							.push({"x": parseInt(senseTime), "y": parseFloat(msg[i][senseType[j]])});
					}
    			}
    			// console.log("network: ", network);
			} else {		// 该节点不在网络中
				var senseType = codeToString(msg[i].sense_type);
    			var node = {
    				"nodeId": nodeId,
    				"senseType": msg[i].sense_type,
    				"sense": {
						"history": {},
						"today": {}
					}
    			};
    			var sense = {};
    			var senseTime = parseToUnixTime(toTimeSerial(msg[i].sense_time));
    			// var senseTime = parseToUnixTime(newDateToString(new Date(msg[i].sense_time)));
				for(var j in senseType) {
					// 下面是传感器归类判断
    				if(senseType[j] in network.sense) { // 该节点的传感器已经在传感器数组中
    				} else {		// 不存在则创建这样的数组
						network.sense[senseType[j]] = [];
    				}
					if(isHistory) {
    					node.sense.history[senseType[j]] = [];
					} else {
    					node.sense.today[senseType[j]] = [];
					}
				}
    			for(var j in senseType) {
    				// 因为我这里将传感器的名字存在数组中，所以要获得传感器名字，则需要senseType[j]
					if(isHistory) {
    					node.sense.history[senseType[j]].push({"x": parseInt(senseTime), "y": parseFloat(msg[i][senseType[j]])});
					} else {
    					node.sense.today[senseType[j]].push({"x": parseInt(senseTime), "y": parseFloat(msg[i][senseType[j]])});
					}
    				if(!isExistByNodeId(node.nodeId, network.sense[senseType[j]])) { // 如果不存在直接添加
    					network.sense[senseType[j]].push(node.nodeId);
    				} else {	// 存在那么什么也不做
    				}
    			}
    			network.node[node.nodeId] = node;
    			// console.log("network: ", network);
			}
		}
		// console.log("network", network);
    } else {			// 这里是判断数据为空的结束的情况
		$('#rtDisplayArea').find('h2').remove();
		$("#noDataAlert").removeClass('hide');
    }
};

// ======================================Google Chart Tools========================================
function gctInit(callback) {
	google.load("visualization", "1", {packages:["corechart"]});
    google.setOnLoadCallback(drawChart);
    function drawChart() {
        var data = google.visualization.arrayToDataTable([
			['Year', 'Sales', 'Expenses'],
			['2004',  1000,      400],
			['2005',  1170,      460],
			['2006',  660,       1120],
			['2007',  1030,      540]
        ]);

        var options = {
			title: 'Company Performance'
        };

        var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
        chart.draw(data, options);
    }
}
