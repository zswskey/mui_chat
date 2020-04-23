// 建立数据库 
	// 注意：建立数据库是同步操作

	//单人聊天表
	db.define('tab_chat', {id:'INTEGER UNIQUE', send_id:'INTEGER', receive_id: 'INTEGER', message:'TEXT NOT NULL',message_type:'INTEGER',session_id:'VARCHAR(50)',send_state:'INTEGER'});
	//群聊天表
	db.define('tab_chat_group', {id:'INTEGER UNIQUE', send_id:'INTEGER', receive_id: 'INTEGER', message:'TEXT NOT NULL',message_type:'INTEGER',group_id:'INTEGER',session_id:'VARCHAR(50)',send_state:'INTEGER'});
	//通讯录表
	db.define('tab_address_book',{ id:'VARCHAR(30) primary key',user_id:'INTEGER',friend_id:'INTEGER',friend_nickname: 'VARCHAR(50)',friend_remark: 'varchar(50)',friend_img: 'LONGTEXT',del_status: 'INTEGER'});
	//群基本信息表
	db.define('tab_group',{group_id:'INTEGER UNIQUE',group_name:'VARCHAR(50)',group_comment:'TEXT',manager:'INTEGER NOT NULL'});
	//群成员表
	db.define('tab_group_member',{id:'INTEGER',user_id:'INTEGER',group_user_name:'VARCHAR(50)',group_id:'INTEGER',user_img:'LONGTEXT'});
	//好友应答表
	db.define('tab_invite_info',{id:'VARCHAR(30) UNIQUE',invite_id:'INTEGER',accept_id: 'INTEGER',group_id:'INTEGER',group_name:'VARCHAR(50)',invite_status:'INTEGER',invite_type:'INTEGER',invite_nick:'VARCHAR(50)',invite_img:'TEXT'});
	/* db.query('SELECT tg.group_id FROM tab_group tg,tab_group_member tgm WHERE tg.group_id = tgm.group_id AND user_id = 13211111111)', function(r){
      	for (var i = 0; i < r.length; i++) {
      	 console.log('查询结果: id:' +r[i].group_id);
      	}
        });*/
      /* var tab_chat=db.instance('tab_chat');
       tab_chat.del('session_id===1311111111118210250805');*/
