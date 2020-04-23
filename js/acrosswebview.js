/**
 * 创建于:2015-5-16<br>
 * 支持回调的跨webview方法调用
 * @author chender
 * @version 0.9
 * TODO 支持传递多个参数
 */
(function($) {
	window.VG = new function() {
		var callbackPool = {};
		var callbackKey = "callbackKey_";
		var callbackIndex = 0;
		var curViewId = null;
		/** 
		 * @description 向回调池里面新增一个callback函数,并返回索引值
		 * @param {Function} callback=[] 回调函数
		 * @return {String} 该回调函数的索引值，可通过该值获取到存放的回调函数
		 */
		this.pushCallback = function(callback) {
				var key = callbackKey + (callbackIndex++);
				callbackPool[key] = callback;
				return key;
			}
			/** 
			 * @description 通过索引值从回调池里面取出一个callback函数
			 * @param {String} key=[] 回调函数索引值
			 * @return {Function} 存放的回调函数
			 */
		this.pullCallback = function(key) {
				var back = callbackPool[key];
				delete callbackPool[key];
				return back;
			}
			/**
			 * @description 调用其他webview的方法，当前webview必须设置id值(方便回调)
			 * @param {Webview} webview=[webview] 需要调用方法的webview
			 * @param {String} methodName=[methodName] 需要调用的方法的名称
			 * @param {JSON} param=[param] 调用时传递的参数，为json格式
			 * @param {Function} callback=[callback] 回调函数
			 */
		this.method = function(webview, methodName, param, callback) {
			curViewId = curViewId ? curViewId : (curViewId = plus.webview.currentWebview().id);
			if(curViewId == null) {
				var msg = "该webview没设置id,无法使用该功能";
				console.log(msg);
				throw new Error(msg);
			}
			if(webview == null) {
				var msg = "找不到对应的webview,webviewDd:" + webviewId;
				console.log(msg);
				throw new Error(msg);
			}
			var callbackKey = null;
			if(callback) {
				callbackKey = this.pushCallback(callback);
			}
			evalJS(webview, "VG._methodCalled", curViewId, methodName, JSON.stringify(param), callbackKey);
		}

		this._methodCalled = function(viewId, methodName, param, callbackKey) {
			//TODO 多参数如何实现
			var method = window.eval(methodName);
			method(JSON.parse(param), callbackKey && function(backParam) {
				evalJS(plus.webview.getWebviewById(viewId), "VG._methodBacked", callbackKey, backParam && JSON.stringify(backParam) || "");
			});
		}
		this._methodBacked = function(callbackKey, backParam) {
			var callback = this.pullCallback(callbackKey);
			callback(backParam && JSON.parse(backParam));
		}

		function evalJS(webview, methodName) {
			var params = "";
			if(arguments.length > 2) {
				for(var i = 2; i < arguments.length; i++) {
					if(arguments[i] === null || arguments[i] === undefined) {
						params += "null,";
					} else {
						params += "'" + arguments[i] + "',";
					}
				}
				params = params.substring(0, params.length - 1);
			}
			webview.evalJS(methodName + "(" + params + ")");
		}
	}
})(window)