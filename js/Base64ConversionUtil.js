/**
 * base64转文件工具类，目前支持图片转换
 */
var Base64ConversionUtil =(function(){
	var myapp = {};
	/**
	 * base64转为图片
	 */
	function bitmapToImg(imgpath,data,callback){
		bitmap = new plus.nativeObj.Bitmap("test");
		bitmap.loadBase64Data(data, function(){
			bitmap.save(imgpath,{}, function(i){
			    var target = i.target;
			    callback({data:data,path:target});
				bitmap.clear();
	        },function(e){
				//console.log('保存图片失败');
				callback({data:data,path:''});
				bitmap.clear();
	     	});
		},function(e){
			//console.log('加载Base64图片数据失败');
			callback({data:data,path:''});
			bitmap.clear();
		});
	};
	
	/**
	 * base64字符串转成语音文件
	 * @param {Object} base64Str
	 * @param {Object} callback
	 */
	myapp.dataURL2Audio = function dataURL2Audio (id,base64Str, callback) {
		var re = /^data:audio\/(wav|amr|mp3);base64,/;
		var suffix = base64Str.match(re);
	    var base64Str = base64Str.replace(/^.*?,/,'');
	    var suffixStr = suffix[1]?suffix[1]:'wav';
	    var audioName = id +"."+ suffixStr;
	    plus.io.requestFileSystem(plus.io.PRIVATE_DOC,function(fs){
	        fs.root.getFile(audioName,{create:true},function(entry){
	            // 获得平台绝对路径
	            var fullPath = entry.fullPath;
	            if(mui.os.android){  
	                // 读取音频
	                var Base64 = plus.android.importClass("android.util.Base64");
	                var FileOutputStream = plus.android.importClass("java.io.FileOutputStream");
	                try{
	                    var out = new FileOutputStream(fullPath);
	                    var bytes = Base64.decode(base64Str, Base64.DEFAULT);
	                    out.write(bytes); 
	                    out.close();
	                    // 回调
	                    callback && callback(entry);
	                }catch(e){
	                    console.log(e.message);
	                }
	            }else if(mui.os.ios){
	                var NSData = plus.ios.importClass('NSData');
	                var nsData = new NSData();
	                nsData = nsData.initWithBase64EncodedStringoptions(base64Str,0);
	                if (nsData) {
	                    nsData.plusCallMethod({writeToFile: fullPath,atomically:true});
	                    plus.ios.deleteObject(nsData);
	                }
	                // 回调
	                callback && callback(entry);
	            }
	        })
	    })
	}
	
	/**
	 * 文件转base64字符串
	 * @param {Object} path callback
	 */
	myapp.startFileToData = function File2dataURL (path,callback) {
	    plus.io.resolveLocalFileSystemURL(path, function(entry){
	        entry.file(function(file){
	            var reader = new plus.io.FileReader();
	            reader.onloadend = function (e) {
	                callback && callback(e.target.result);// 回调
	            };
	            reader.readAsDataURL(file);
	        },function(e){
	            mui.toast("读写出现异常: " + e.message );
	        })
	    })
	}

	/**
	 * 图片转换任务
	 * @param {Object} obj 数组对象，包含 base64 customFileName 属性
	 */
	myapp.startTask = function startTask(id,data,callback) {
		var sd_path,base64Str,customFileName,temp = new Image();
		base64Str = data;
		customFileName = '_doc/image/'+id+".jpg";
		bitmapToImg(customFileName,base64Str,function(event){
			sd_path =event.path;
        	temp.src = sd_path; //SD卡绝对路径
			temp.onload = function() {
				//已成功
				callback&&callback({state:1,sd_path:sd_path});
			};
			temp.onerror = function() {
				//处理失败
				console.log("处理失败");
				callback&&callback({state:0,sd_path:base64Str});
			};
		});
	};
	return myapp;
}());
