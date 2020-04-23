/**
 * app全局常量 变量参数定义
 * app页面必引js：websqlwrapper.js constant.js 
 */
var oneself = localStorage.getItem("phoneNumber");//登录用户id
var Url = 'http://192.168.21.27:3000';//服务器地址
//读取本地数据库  *注意：页面引入该js前需先引用websqlwrapper.js
var db = WebsqlWrapper({
	name: 'hcrchatDB',
	displayName: 'database for local caching',
	version: 1,
	maxSize: 20*1042*1024
});