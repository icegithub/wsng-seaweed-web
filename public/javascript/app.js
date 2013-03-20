// 当所有资源全部加载完毕之后运行以下代码
$(document).ready(function() {	
	// 存为全局对象，方便以后的管理，后期会写入本地数据库，现期还是存放在内存中
	window.network = {
		"name": "Wireless Sensor Network Group(CIT) and SMARTWIN Co.",
		"node": {},		// 用一个node对象管理网络中所有的节点,存入的是单个节点的对象,使用nodeId作为键值，加快后面的检索速度。
		"sense": {		// 这里是传感器的对象管理
			"today":{},	// 存放今天的数据（数据为传感器：采集数据（时间：值））
			"history":{}
		}
	};


	// 以下是首页展示今天数据的处理函数
	//这个函数先请求信息，然后将获得的数据处理,经过下面这段代码处理，当日实时数据基本归位
    var requestData = generateToday();
    queryTodayCapture(requestData,receiveDataHandler); // receiveDataHandler在helper.js中

	// console.log("network", network.node);
	// /////////////////////////////////////////////////////
	// 这里绘制实时数据,页面加载时就绘制
	for(var i in network.node) {
		// console.log(i, ":", network.node[i]);
		var node = network.node[i]
		  , nodeId = node.nodeId
		  , todayData = node.sense.today
		  ;
		// console.log(node, nodeId, todayData);
		for(var type in todayData) {
			var sense = type
			  , renderTo = 'rt_'+nodeId+'_'+sense;
			$('#'+renderTo).html(sense);
			var info = {
				renderTo: renderTo,
				nodeId: nodeId,
				senseType: type,
				data: todayData[type]
			}
			// console.log("in app.js");
			// for (var i in info.data) {
			// 	console.log(info.data[i].x, ":", info.data[i].y);
			// }
			var chartOptions = drawOptions(info);
			var browser = navigator.appVersion;
			var killIE = browser.slice(0,1);
			// if(killIE > 4)
			  new Highcharts.Chart(chartOptions);
		}
	}

	// //////////////////////////////////////////////////
	// 这里绘制查询的结果图表
	// 一个订阅发布系统的处理函数
	$.subscribe("/draw/query", drawQuery);
	function drawQuery() {
		console.log("in app.js:", network);
		var $drawQueryArea = $('#drawQueryArea')
		  , renderTo = 'drawQueryArea'
		  , nodeId = sltNodeId
		  , senseType = sltSenseType
		  , data = network.node[nodeId]["sense"]["history"][senseType]
		  ;
		var info = {
			renderTo: renderTo,
			nodeId: nodeId,
			senseType: senseType,
			data: data
		}
		var chartOptions = drawOptions(info);
		var browser = navigator.appVersion;
		var killIE = browser.slice(0,1);
		// if(killIE > 4)
		new Highcharts.Chart(chartOptions);
		// $('#drawQuery').html('历史数据将呈现');
	}
});
