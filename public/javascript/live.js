jQuery.noConflict();		// 解除jQuery的$
jQuery(function($) {
    console.log("Welcome here");
    var time = new Date();
    console.log(time);
    // $('.nowTime').html(time);//script has load but html is not load over

    $.ajax({
    	type: 'GET',
    	url: '/cat'
    }).success(function(data) {
    	showLoginInfo(data);
    });
    function showLoginInfo(data) {
	if (data) {
	    var user = [];
	    var elt = $("#loginInfo");
	    for(var i in data) {
		var userIp = data[i].userIp;
		var loginTime = data[i].loginTime;
		var tr = $("<tr>")
		    .append("<td>"+userIp+"</td>")
		    .append("<td>"+loginTime+"</td>");
		elt.append(tr);
		user.push({userIp: userIp, loginTim: loginTime});
	    }
	    console.log(user);
	} else {
	    alert("These is no login record!");
	}
    };
});

