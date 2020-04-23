//与服务器交互，更新本地数据库
var updateflag = 0;//更新计数
var reqCount=oneself;

//通讯录
var tab_address_book = db.instance('tab_address_book');
//单人聊天表
var tab_chat = db.instance('tab_chat');
//群聊天表
var tab_chat_group = db.instance('tab_chat_group');
//群信息表
var tab_group = db.instance('tab_group');
//群成员表
var tab_group_member = db.instance('tab_group_member');
//好友应答表
var tab_invite_info = db.instance('tab_invite_info');

function updateDBOffline(){
//查询本地数据库并更新
db.query('SELECT * FROM tab_address_book where user_id = '+oneself, function(r){
	if(r&&r.length>0){
		//更新通讯录
		setTimeout(function () {
			 mui.ajax(Url+'/friend/update',{
		        data: {account:oneself},
		        dataType:'json',//服务器返回json格式数据
		        type:'get',//HTTP请求类型
		        timeout:5000,//超时时间设置为5秒；
		        success:function(r){
					if(r.status&&r.count>0){
						var data = r.data;
						 var arr = [];
						for (var i = 0,len = data.length; i < len; i++) {
							var friend = data[i],
							delstatus = 3==friend.message_type?1:0;
							id = oneself+""+friend.account;
							arr.push({type: 'save', args: [{id:id,user_id:oneself,friend_id:friend.account,friend_nickname: friend.user_name,friend_remark: friend.friend_remark,friend_img: friend.img,del_status: delstatus}, 'id']});
						}
						tab_address_book.batch(arr);
					}
					updateflag++;
		        },
		        error:function(xhr,type,errorThrown){
		            updateflag++;
		        }
		   });
		},10);
		//更新群组信息
		setTimeout(function () {
			 mui.ajax(Url+'/group/update',{
		        data: {account:oneself},
		        dataType:'json',//服务器返回json格式数据
		        type:'get',//HTTP请求类型
		        timeout:5000,//超时时间设置为5秒；
		        success:function(r){
					if(r.status&&r.count>0){
						var data = r.data;
						var arr = [];
						for (var i = 0,len = data.length; i < len; i++) {
							var group = data[i];
							var groupmember = group.group_member;
							 var arr2 = [];
							arr.push({type: 'save', args: [{group_id:group.group_id,group_name:group.group_name,group_comment:group.group_comment,manager:group.manager_id}, 'group_id']});
							for (var j = 0,leng = groupmember.length; j < leng; j++) {
								var onemember = groupmember[j];
								if(4==onemember.message_type){//删除群成员
									arr2.push({type: 'del', args: ['user_id === '+onemember.account]});
								}else{
									arr2.push({type: 'save', args: [{id:oneself+onemember.group_id,user_id:onemember.account,group_user_name:onemember.group_user_name,group_id:onemember.group_id}, 'id']});
								}
							}
							tab_group_member.batch(arr2);
						}
						tab_group.batch(arr);
					}
					updateflag++;
		        },
		        error:function(xhr,type,errorThrown){
		            updateflag++;
		        }
		    });
		},10);
	}else{
		//通讯录同步
		setTimeout(function () {
			mui.ajax(Url+'/friend/findAll',{
		        data: {account:oneself},
		        dataType:'json',//服务器返回json格式数据
		        type:'get',//HTTP请求类型
		        timeout:5000,//超时时间设置为5秒；
		        success:function(r){
					if(r.status&&r.count>0){
						var data = r.data;
						var arr = [];
						for (var i = 0,len = data.length; i < len; i++) {
							var friend = data[i],
							delstatus = 3==friend.message_type?1:0;
							id = oneself+""+friend.account;
							arr.push({type: 'save', args: [{id:id,user_id:oneself,friend_id:friend.account,friend_nickname: friend.user_name,friend_remark: friend.friend_remark,friend_img: friend.img,del_status: delstatus}, 'id']});
						}
						tab_address_book.batch(arr);
					}
					updateflag++;
		        },
		        error:function(xhr,type,errorThrown){
		            updateflag++;
		        }
		   });
		},10);
		//群组信息同步
		setTimeout(function () {
			 mui.ajax(Url+'/group/findAll',{
		        data: {account:oneself},
		        dataType:'json',//服务器返回json格式数据
		        type:'get',//HTTP请求类型
		        timeout:5000,//超时时间设置为5秒；
		        success:function(r){
					if(r.status&&r.count>0){
						var data = r.data;
						var arr = [];
						for (var i = 0,len = data.length; i < len; i++) {
							var group = data[i];
							var groupmember = group.group_member;
							var arr2 = [];
							arr.push({type: 'save', args: [{group_id:group.group_id,group_name:group.group_name,group_comment:group.group_comment,manager:group.manager_id}, 'group_id']});
							for (var j = 0,leng = groupmember.length; j < leng; j++) {
								var onemember = groupmember[j];
								arr2.push({type: 'save', args: [{id:onemember.account+onemember.group_id,user_id:onemember.account,group_user_name:onemember.group_user_name,group_id:onemember.group_id}, 'id']});
							}
							tab_group_member.batch(arr2);
						}
						tab_group.batch(arr);
					}
					updateflag++;
		        },
		        error:function(xhr,type,errorThrown){
		            updateflag++;
		        }
		   });
		},10);
	};
	
	var taskArr = [];//任务集合
	//递归调用方式保持只有一个消息存储任务,避免批量处理失败
	function saveChatMessage(id,sessionid){
		if (taskArr.length == 0) {
			updateflag++;
			return;
		}
		var ichat = taskArr.shift();
		id +=1;
		var message = ichat.message_type==1||ichat.message_type==3?ichat.img:ichat.message;
		if(1==ichat.message_type){//图片转换
			Base64ConversionUtil.startTask(id,message,function(metadata){
				message = metadata.sd_path;
				tab_chat.save({id: id,send_id: ichat.send_id,receive_id: oneself,message: message,message_type: ichat.message_type,session_id: sessionid,send_state: 1}, 'id',function(){
					saveChatMessage(id,sessionid);
				});
			});
		}else if(3==ichat.message_type){//语音转换
			Base64ConversionUtil.dataURL2Audio(id,message,function(entry){
				message = entry.toURL();
				tab_chat.save({id: id,send_id: ichat.send_id,receive_id: oneself,message: message,message_type: ichat.message_type,session_id: sessionid,send_state: 1}, 'id',function(){
					saveChatMessage(id,sessionid);
				});
			});
		}else{
			tab_chat.save({id: id,send_id: ichat.send_id,receive_id: oneself,message: message,message_type: ichat.message_type,session_id: sessionid,send_state: 1}, 'id',function(){
				saveChatMessage(id,sessionid);
			});
		}				
	};
	
	//更新二人聊天
	mui.ajax(Url+'/chat/friend/findAll',{
        data: {account:oneself},
        dataType:'json',//服务器返回json格式数据
        type:'get',//HTTP请求类型
        timeout:5000,//超时时间设置为5秒；
        success:function(r){
			if(r.status&&r.count>0){
				var data = r.data;
				for (var i = 0,len = data.length; i < len; i++) {
					var chat = data[i].chat,
					sendId = data[i].sendId;
					if(chat&&chat.length>0){
						var sessionid = oneself + "" + sendId;
						var nowChatNum = localStorage.getItem(sessionid)?parseInt(localStorage.getItem(sessionid))+chat.length:chat.length;
						localStorage.setItem(sessionid,nowChatNum);
						id = new Date().getTime();
						for (var j = 0; j < chat.length; j++) {
							var ichat = chat[j];
							taskArr.push(ichat);
						}
						//同步存储消息内容
						saveChatMessage(id,sessionid);
					}
				}
			}else{
				updateflag++;
			}
        },
        error:function(xhr,type,errorThrown){
            updateflag++;
        }
    });
	
	//更新群组消息个数
	 mui.ajax(Url+'/chat/group/count',{
        data: {account:oneself},
        dataType:'json',//服务器返回json格式数据
        type:'get',//HTTP请求类型
        timeout:5000,//超时时间设置为5秒；
        success:function(r){
			if(r.status&&r.count>0){
				var data = r.data;
				for (var i = 0,len = data.length; i < len; i++) {
					var chat_group = data[i];
					var sessionid = oneself + "" + chat_group.group_id;
					var nowChatNum = localStorage.getItem(sessionid)?parseInt(localStorage.getItem(sessionid))+chat_group.count:chat_group.count;
					localStorage.setItem(sessionid,nowChatNum);
				}
			}
			updateflag++;
        },
        error:function(xhr,type,errorThrown){
            updateflag++;
        }
    });
	
	//更新邀请表
	 mui.ajax(Url+'/invite/findAll',{
        data: {account:oneself},
        dataType:'json',//服务器返回json格式数据
        type:'get',//HTTP请求类型
        timeout:5000,//超时时间设置为5秒；
        success:function(r){
			if(r.status&&r.count>0){
				var data = r.data;
				var arr = [];
				var reqCount='txl'+localStorage.getItem("phoneNumber");
				localStorage.setItem(reqCount,data.length);
				for (var i = 0,len = data.length; i < len; i++) {
					var invite = data[i];
					invitetype = invite.invite_type,
					invitenick = 1==invitetype? invite.group_name : invite.user_name,
					inviteimg = 1==invitetype? '' : invite.img,
					id = 1==invitetype? oneself + "" + invite.group_id : oneself + "" + invite.account;
					arr.push({type: 'save', args: [{id:id,invite_id:invite.account,accept_id: invite.accept_id,group_id:invite.group_id,group_name:invite.group_name,invite_status:0,invite_type:invitetype,invite_nick:invitenick,invite_img:inviteimg}, 'id']});
				}
				tab_invite_info.batch(arr);
			}
			updateflag++;
        },
        error:function(xhr,type,errorThrown){
            updateflag++;
        }
    });
	
});	
};
//updateDBOffline();
//倒计时检测函数
var EndAjax = function (number,endFunc) {
	this.time = 60; //时间秒
	this.number = number;
    this.endFunc = endFunc; //结束函数
    this.flag = 't' + Date.parse(new Date());
};
EndAjax.prototype.check = function () {
    var self = this;
    self.flag = setInterval(function () {
	    if (updateflag >self.number||self.time < 0) {
	        clearInterval(self.flag);
	        updateflag = 0;
	        self.endFunc();
	    }else {
            self.time--;
        }
	}, 1000);
};
