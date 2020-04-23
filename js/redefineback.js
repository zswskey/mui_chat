//重写mui.back方法，刷新返回页
var _back = mui.back;           
mui.back = function () {
	var self = plus.webview.currentWebview();
	var wo=self.opener();
	if(wo&&wo.id){
		var id = wo.id;
		if(id == 'tab-webview-subpage-contact.html') {
			wo.evalJS("updateDatabase();");
		} else if(id == 'tab-webview-subpage-setting.html') {
			wo.evalJS("updateDatabase();");
		}else if(id == 'new-friend.html'){
			wo.reload(true);
		}
	}
	_back();
};