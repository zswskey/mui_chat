			mui.plusReady(function(){
				if(plus.os.name=='iOS'&&plus.os.version=='10.0.2'){
					if(plus.networkinfo.getCurrentType()!=3){
						mui.toast("当前网络不可用，请稍后再连");
					}
				}
				console.log(plus.networkinfo.getCurrentType());
				if(plus.networkinfo.getCurrentType()==0||plus.networkinfo.getCurrentType()==1){
					mui.toast("当前网络不可用，请稍后再连");
				}else if(plus.networkinfo.getCurrentType()==3){
					mui.toast("当前网络良好，请使用");
				}else if(plus.networkinfo.getCurrentType()==4){
					mui.toast("当前网络是2g网络，可能费流量");
				}else if(plus.networkinfo.getCurrentType()==5){
					mui.toast("当前网络是3g网络，可能费流量");
				}else if(plus.networkinfo.getCurrentType()==6){
					mui.toast("当前网络是4g网络，可能费流量");
				}
			})