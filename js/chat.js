//获取图片拍摄角度,用于修复android手机照片旋转问题
var getImgOrientation = function(path,callback){
	var rotationangle = 0;
	var image = new Image(); 
	image.src = path;
	image.onload = function() {
		//获取照片方向角属性 
        EXIF.getData(image, function() { 
            EXIF.getAllTags(this); 
            var Orientation = EXIF.getTag(this, 'Orientation');
            if(Orientation != "" && Orientation != 1){
                switch(Orientation){  
                    case 6://顺时针90度旋转   
                        rotationangle = 90;
                        break;  
                    case 8://逆时针90度旋转  
                        rotationangle = -90;  
                        break;  
                    case 3://顺时针180度旋转  
                        rotationangle = 180;
                        break;  
                }         
            }  
            callback(rotationangle);
        }); 
	};
};

//对图片旋转处理
var rotateImg = function (img, direction,canvas) {  
        //最小与最大旋转方向，图片旋转4次后回到原方向  
        var min_step = 0;  
        var max_step = 3;  
        //var img = document.getElementById(pid);  
        if (img == null)return;  
        //img的高度和宽度不能在img元素隐藏后获取，否则会出错  
        var height = img.height;  
        var width = img.width;  
        //var step = img.getAttribute('step');  
        var step = 2;  
        if (step == null) {  
            step = min_step;  
        }  
        if (direction == 'right') {  
            step++;  
            //旋转到原位置，即超过最大值  
            step > max_step && (step = min_step);  
        } else {  
            step--;  
            step < min_step && (step = max_step);  
        }  
        
        //旋转角度以弧度值为参数  
        var degree = step * 90 * Math.PI / 180;  
        var ctx = canvas.getContext('2d');  
        switch (step) {  
            case 0:  
                canvas.width = width;  
                canvas.height = height;  
                ctx.drawImage(img, 0, 0);  
                break;  
            case 1:  
                canvas.width = height;  
                canvas.height = width;  
                ctx.rotate(degree);  
                ctx.drawImage(img, 0, -height);  
                break;  
            case 2:  
                canvas.width = width;  
                canvas.height = height;  
                ctx.rotate(degree);  
                ctx.drawImage(img, -width, -height);  
                break;  
            case 3:  
                canvas.width = height;  
                canvas.height = width;  
                ctx.rotate(degree);  
                ctx.drawImage(img, -width, 0);  
                break;  
        }  
    };  


//删除指定文件
var delFile = function (hb_path) {
	if (hb_path) {
		plus.io.resolveLocalFileSystemURL(hb_path, function(entry) {
			entry.remove(function(entry) {
				console.log("文件删除成功=" + hb_path);
			}, function(e) {
				console.log("文件删除失败=" + hb_path);
			});
		});
	}
};

//转base64编码
 var toBase64Code = function(path,rotationangle,callback){
	var image = new Image(); 
	image.src = path;
	image.onload = function() {
		var expectWidth = this.naturalWidth;  
        var expectHeight = this.naturalHeight;  
//      if (this.naturalWidth > this.naturalHeight && this.naturalWidth > 400) {  
//          expectWidth = 400;  
//          expectHeight = expectWidth * this.naturalHeight / this.naturalWidth;  
//      } else if (this.naturalHeight > this.naturalWidth && this.naturalHeight > 600) {  
//          expectHeight = 600;  
//          expectWidth = expectHeight * this.naturalWidth / this.naturalHeight;  
//      }
        //新建画布
        var canvas = document.createElement("canvas");  
        var ctx = canvas.getContext("2d");  
        canvas.width = expectWidth;  
        canvas.height = expectHeight;  
        ctx.drawImage(this, 0, 0, expectWidth, expectHeight);
        //旋转图片
        if(rotationangle != "" && rotationangle > 0){   
            switch(rotationangle){  
                case 90://需要顺时针（向左）90度旋转   
                    rotateImg(this,'left',canvas);  
                    break;  
                case -90://需要逆时针（向右）90度旋转  
                    rotateImg(this,'right',canvas);  
                    break;  
                case 180://需要180度旋转  
                    rotateImg(this,'right',canvas);//转两次  
                    rotateImg(this,'right',canvas);  
                    break;  
            }         
       	}; 
        var base64 = canvas.toDataURL("image/jpeg", 0.3);
        callback(base64);
	}
};

//图片压缩
var ImagedataURL = function (imgid,path,rotationangle,callback) {
	plus.zip.compressImage({
			src:path,
			dst:"_doc/"+imgid+".jpg",
			format: 'jpg',
			overwrite:true,
			rotate:rotationangle
		},
		function(event) {
			callback(event.target);//返回path路径
		},function(error) {
			console.log("图片压缩失败!");
	});
};

//倒计时执行函数
var Alarm = function (time,id, endFunc) {
        this.time = time; //时间秒
        this.id = id;
        this.endFunc = endFunc; //结束函数
        this.flag = 't' + Date.parse(new Date()); //
    };
Alarm.prototype.start = function () {
    var self = this;
    self.flag = setInterval(function () {
        if (self.time < 0) {
            clearInterval(self.flag);
            self.endFunc(self.id);
            //console.log('计时结束');
        } else {
            self.time--;
        }
    }, 1000);
};