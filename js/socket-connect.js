/*
 * =====================================================
 * socket 网络连接 判断当前网络状态及服务器响应状态
 * =====================================================
 */
var that = this;
var reqMessage=0;
//获取当前页面名称
var pagename = window.location.href;
pagename=pagename.substring(pagename.lastIndexOf("/") + 1);
//连接服务器
that.socket = io.connect(Url);

//***************************************聊天页面相关内容*******************************
//单人聊天表
var tab_chat = db.instance('tab_chat');
//群聊天表
var tab_chat_group = db.instance('tab_chat_group');
//好友应答表
var tab_invite_info = db.instance('tab_invite_info');
//通讯录表
var tab_address_book = db.instance('tab_address_book');
//群基本信息
var tab_group = db.instance('tab_group');
//群成员表
var tab_group_member = db.instance('tab_group_member');

//更新聊天列表页数据
var updateChatList = function(){
var wvs=plus.webview.getWebviewById('tab-webview-subpage-chat.html');
   wvs.evalJS("pulldownRefresh();");
};

//更新通讯录列表
var updateContactList = function(){
	var mainPage=plus.webview.getWebviewById('tab-webview-main.html');
	mui.fire(mainPage,"updateContactNumber",{reqCount:localStorage.getItem(reqCount)})
};
//更新聊天页信息
var updateImChat = function(sessionid,id,data,type){
	var chatPage=plus.webview.getWebviewById(sessionid);
	if(chatPage){
		mui.fire(chatPage,'updateImChat',{id:id,data:data});
	}
};

//socket消息接收转发接口方法
function socketReceiveInterface(viewArr,sendName,data){
	for(var i in viewArr){
		var webview=plus.webview.getWebviewById(viewArr[i]);
		if(webview&&webview.isVisible()){
			mui.fire(webview,sendName,{data:data});
			return;
		}
	}
};

//好友聊天记录存储
var savePrivateChatMessage = function(id,sessionid,data){
	tab_chat.save({id: id,send_id: data.user,receive_id: data.to,message: data.msg,message_type: data.contenttype,session_id: sessionid,send_state: 1}, 'id',function(){
		var nowPage=plus.webview.getWebviewById(sessionid);
		if(!(nowPage&&nowPage.isVisible())){
			var nowChatNum = localStorage.getItem(sessionid)?parseInt(localStorage.getItem(sessionid))+1:1;
			localStorage.setItem(sessionid,nowChatNum);
		}
		updateChatList();
		updateImChat(sessionid,id,data);
	});
};

//单人聊天消息接收
that.socket.on('privateChat', function(data, fn) {
	fn(true);
	var id = new Date().getTime();
	var sessionid = data.to + "" + data.user;
	if(1==data.contenttype){//base64处理为图片
		Base64ConversionUtil.startTask(id,data.msg,function(metadata){
			data.msg = metadata.sd_path;
			setTimeout(function(){
			   savePrivateChatMessage(id,sessionid,data);
			},20);					
		});
	}else if(3==data.contenttype){//base64转换语音
		Base64ConversionUtil.dataURL2Audio(id,data.msg,function(entry){
			data.msg = entry.toURL();
			//console.log('============'+data.msg);
			setTimeout(function(){
			   savePrivateChatMessage(id,sessionid,data);
			},20);
		});
	}else{
		savePrivateChatMessage(id,sessionid,data);
	}
});

//群聊天记录存储
var saveGroupChatMessage = function(id,sessionid,user,data){
	tab_chat_group.save({id: id,send_id: user,receive_id: oneself,message: data.msg,message_type: data.contenttype,group_id: data.to,session_id:sessionid,send_state: 1}, 'id',function(){
		var nowPage=plus.webview.getWebviewById(sessionid);
		if(!(nowPage&&nowPage.isVisible())){
			var nowChatNum = localStorage.getItem(sessionid)?parseInt(localStorage.getItem(sessionid))+1:1;
			localStorage.setItem(sessionid,nowChatNum);
		}
		updateChatList();
		updateImChat(sessionid,id,data);
	});
};
//群聊消息接收
that.socket.on('groupChat', function(user, data) {
	var id = new Date().getTime();
	var sessionid = oneself+""+data.to;
	if(1==data.contenttype){//转换为图片
		Base64ConversionUtil.startTask(id,data.msg,function(metadata){
			data.msg = metadata.sd_path;
			setTimeout(function(){
			   saveGroupChatMessage(id,sessionid,user,data);
			},20);					
		});
	}else if(3==data.contenttype){//语音转换
		Base64ConversionUtil.dataURL2Audio(id,data.msg,function(entry){
			data.msg = entry.toURL();
			setTimeout(function(){
			  saveGroupChatMessage(id,sessionid,user,data);
			},20);
		});
	}else{
		saveGroupChatMessage(id,sessionid,user,data);
	}
});

//************************************聊天页面相关内容END*******************************
//好友请求
	var addFriend = !~pagename.indexOf('new-friend.html') ? 'addFriend' : 'missr';
	socket.on(addFriend, function(data, callback) {
		callback(true);
		if(data.to == oneself) {
			if(data.type == 3) {
				tab_invite_info.save({
					id: oneself + data.user,
					invite_id: data.user,
					accept_id: data.to,
					group_id: null,
					group_name: null,
					invite_status: 0,
					invite_type: 0,
					invite_nick: data.reqnick,
					invite_img: data.reqhead
				}, 'id', function() {
					var reqCount='txl'+localStorage.getItem("phoneNumber");
					var reqMessage = localStorage.getItem(reqCount)?parseInt(localStorage.getItem(reqCount))+1:1;
					localStorage.setItem(reqCount,reqMessage);
					var mainPage = plus.webview.getWebviewById('tab-webview-main.html');
					var contactPage = plus.webview.getWebviewById('tab-webview-subpage-contact.html');
					mainPage.evalJS("updateContactNumber();");
					contactPage.evalJS("updateDatabase();");
					//mui.fire(mainPage,'updateContactNumber',{reqCount:localStorage.getItem(reqCount+"contact")});
					//mui.fire(contactPage,'updateDatabase',{reqCount:localStorage.getItem(reqCount+"contact")});*/
				})
			}
		}
	});

//好友应答发起人不在当前页处理
	var addFriendResult1 = !~pagename.indexOf('add-friend.html') && !~pagename.indexOf('new-friend.html') ? 'addFriendResult' : 'misst';
	that.socket.on(addFriendResult1, function(data, callback) {
		console.log(JSON.stringify(data));
		callback(true);
		if(data.user == oneself) {
			tab_address_book.insert({
				id: oneself + data.to,
				user_id: data.user,
				friend_id: data.to,
				friend_nickname: data.tonick,
				friend_remark: data.tonick,
				friend_img: data.tohead,
				del_status: 0
			})
			var sessionid = oneself + "" + data.to;
			tab_chat.save({
				id: new Date().getTime(),
				send_id: data.to,
				receive_id: oneself,
				message: '我们已经是好友了，开始聊天吧！',
				message_type: '2',
				session_id: oneself + data.to,
				send_state: '1'
			}, 'session_id', function() {
				var wvs = plus.webview.getWebviewById('tab-webview-subpage-contact.html');
				wvs.evalJS("updateDatabase();");
				var w = plus.webview.getWebviewById('tab-webview-main.html');
				setTimeout(function() {
					updateChatList();
					var nowChatNum = localStorage.getItem(sessionid) ? parseInt(localStorage.getItem(sessionid)) + 1 : 1;
					localStorage.setItem(sessionid, nowChatNum);
				}, 1000);
			});
		} else {
			tab_address_book.insert({
				id: data.user + oneself,
				user_id: data.to,
				friend_id: data.user,
				friend_nickname: data.tonick,
				friend_remark: data.tonick,
				friend_img: data.tohead,
				del_status: 0
			})
			var sessionid = oneself + "" + data.to;
			tab_chat.save({
				id: new Date().getTime(),
				send_id: data.to,
				receive_id: oneself,
				message: '我们已经是好友了，开始聊天吧！',
				message_type: '2',
				session_id: oneself + data.to,
				send_state: '1'
			}, 'session_id', function() {
				var wvs = plus.webview.getWebviewById('tab-webview-subpage-contact.html');
				wvs.evalJS("updateDatabase();");
				//var w = plus.webview.getWebviewById('tab-webview-main.html');
				setTimeout(function() {
					updateChatList();
					var nowChatNum = localStorage.getItem(sessionid) ? parseInt(localStorage.getItem(sessionid)) + 1 : 1;
					localStorage.setItem(sessionid, nowChatNum);
				}, 1000);
			});
		}
	})

	//接收群消息推送处理
	var addGroupFriends = !~pagename.indexOf('new-friend.html') ? 'addGroupFriends' : 'missy';
	that.socket.on(addGroupFriends, function(data, callback) { //接受的方法命名方法需确认
		callback(true);
		console.log(JSON.stringify(data));
		if(data.type == 6) {
			if(data.manager_id == oneself) {} else {
				tab_invite_info.save({
					id: data.to + data.groupid,
					invite_id: data.user,
					accept_id: data.to,
					group_id: data.groupid,
					group_name: data.groupname,
					invite_status: 0,
					invite_type: 1,
					invite_nick: data.groupname,
					invite_img: data.grouphead
				},'id',function(){
					console.log("jinlai");
					var reqCount='txl'+localStorage.getItem("phoneNumber");
					var reqMessage = localStorage.getItem(reqCount)?parseInt(localStorage.getItem(reqCount))+1:1;
					localStorage.setItem(reqCount,reqMessage);
					var mainPage = plus.webview.getWebviewById('tab-webview-main.html');
					var contactPage = plus.webview.getWebviewById('tab-webview-subpage-contact.html');
					mainPage.evalJS("updateContactNumber();");
					contactPage.evalJS("updateDatabase();");
		})
				}
			} else if(data.type == 7) {
				tab_invite_info.save({
					id: data.to + data.groupid,
					invite_id: data.user,
					accept_id: data.to,
					group_id: data.groupid,
					group_name: data.groupname,
					invite_status: 0,
					invite_type: 1,
					invite_nick: data.groupname,
					invite_img: data.grouphead
				},'id',function(){
					var reqCount='txl'+localStorage.getItem("phoneNumber");
						var reqMessage = localStorage.getItem(reqCount)?parseInt(localStorage.getItem(reqCount))+1:1;
						localStorage.setItem(reqCount,reqMessage);
						var mainPage = plus.webview.getWebviewById('tab-webview-main.html');
						var contactPage = plus.webview.getWebviewById('tab-webview-subpage-contact.html');
						mainPage.evalJS("updateContactNumber();");
						contactPage.evalJS("updateDatabase();");
				})
		}
	})


	//删除好友公共接受
	var deleteFriend = !~pagename.indexOf('add-friend.html') && !~pagename.indexOf('tab-webview-subpage-contact.html') ? 'deleteFriend' : 'error';
	that.socket.on('deleteFriend', function(data, callback) {
		callback(true);
		var type = data.type,
			userid, user = data.user;
		if(type == 10) {
			if(oneself == user) { //判断是否为当前用户
				userid = user + "" + data.to;
				tab_address_book.del('id === "' + userid + '"');
				tab_chat.del('session_id === "' + userid + '"');
			} else {
				userid = data.to + "" + user;
				tab_address_book.update({
					id: userid,
					del_status: 1
				}, 'id');
				tab_chat.del('session_id === "' + userid + '"');
			}
		}
	});

that.socket.on('connect', function() {
	that.socket.emit('join', {
		user: oneself,
		roomID: ''
	}, function(e) {
		updateDBOffline();
		//mui.toast("连接服务器成功！");
	});
});

that.socket.on('reconnect', function(data) {
	//mui.toast('与服务器重新连接！');
});
that.socket.on('disconnect', function(data) {
	//服务器断开连接 
	//mui.toast("与服务器断开连接，请稍后重试！");
});

//自定义事件，重连socket
document.addEventListener('socketRefresh', function(event) {
	var noConnect = that.socket.id?false:true;
	if(noConnect){
		that.socket.connect();
	}
});