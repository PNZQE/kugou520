//加载页
function getData(type, _url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open(type, _url);
	xhr.send();
	xhr.addEventListener("readystatechange", function() {
		if(xhr.readyState == 4 && xhr.status == 200) {
			//加载全部的音乐
			var result = JSON.parse(xhr.responseText);
			var arr = [];
			//获取所有音乐的路径，准备进行预加载
			for(var i = 0; i < result.length; i++) {
				var str = result[i].audio;
				arr.push(str);
			}
			callback(arr);
		}
	})
}

//绘制预加载圆形进度条
getData("get", "js/music.json", function(data) {
	var preloadCircle = document.querySelector(".preloadCircle");
	var rig = document.querySelector(".right");
	var lef = document.querySelector(".left");
	var queue = new createjs.LoadQueue;
	queue.loadManifest(data);
	queue.on("progress", function(res) {
		var num = 0;
		var progress = Math.ceil(res.progress * 100);
		if(progress <= 50) {
			num = progress * 3.6;
			rig.style.transform = "rotate(" + num + "deg)";
		} else {
			num = (progress - 50) * 3.6;
			rig.style.background = "skyblue";
			rig.style.transform = "rotate(" + num + "deg)";
		}
	})
	queue.on("complete", function(res) {
		preloadCircle.style.display = "none";
	})
})

//加载动画页
var preload = document.querySelector(".preload");
var preload_rocket = document.querySelector(".preload_rocket"); //火箭
var preload_btn = document.querySelector(".preload_btn"); //跳过按钮
//火箭动画
var timer = setInterval(function() {
	var _src = preload_rocket.querySelector("img").src;
	var img_prefix = _src.split("img/")[0];
	var img_src = _src.split("img/")[1];
	if(img_src == "preload_rocket1.png") {
		preload_rocket.querySelector("img").src = img_prefix + "img/preload_rocket2.png";
	} else {
		preload_rocket.querySelector("img").src = img_prefix + "img/preload_rocket1.png";
	}
}, 500);

preload_btn.onclick = function() {
	clearInterval(timer);
	preload.style.display = "none";
}

//首页中间图片颜色切换
var web = document.querySelector(".web");
var imgs = document.querySelector(".center").querySelectorAll("img");
setTimeout(function() {
	setInterval(function() {
		var img_prefix1 = imgs[1].src.split("img/")[0];
		var img_src1 = imgs[1].src.split("img/")[1];
		if(img_src1 == "index_mouse1.png") {
			imgs[1].src = img_prefix1 + "img/index_mouse2.png";
		} else {
			imgs[1].src = img_prefix1 + "img/index_mouse1.png";
		}

		var img_prefix2 = imgs[2].src.split("img/")[0];
		var img_src2 = imgs[2].src.split("img/")[1];
		if(img_src2 == "index_people1.png") {
			imgs[2].src = img_prefix2 + "img/index_people2.png";
		} else {
			imgs[2].src = img_prefix2 + "img/index_people1.png";
		}
	}, 500)
}, 2300);


//点击开始游戏按钮，开始做题
document.querySelector(".btn").onclick = function() {
	web.style.display = "none";
	var question = document.querySelector(".question");
	var optionSel = document.querySelector(".option");
	question.style.display = "block";
	optionSel.style.display = "flex";
	daojishi(); //倒计时
	render(); //通过ajax拿到问题的数据
}

//ajax请求
function render() {
	getMusicData("get", "js/music.json", function(data) {
		renderData(data); //将数据渲染到页面上
		
		//点击下一题也会改变背景和题目
		document.querySelector(".nextQuestion").ontouchend = function() {
			changeQuesBg();
			renderData(data);
		}
		
		//对三个选项添加点击事件
		var optionSelects = document.querySelectorAll(".option_select");
		for(let i = 0; i < optionSelects.length; i++) {
			optionSelects[i].ontouchend = function() {
				count += answer(data, i); //answer用于对答案
				deleteImg(this); //将用户答完之后的对错去掉
				//渲染下一题
				setTimeout(function() {
					renderData(data);
					changeQuesBg();
				}, 300)
			}
		}
	});
}

//拿到数据
function getMusicData(type, _url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open(type, _url);
	xhr.send();
	xhr.addEventListener("readystatechange", function() {
		if(xhr.readyState == 4 && xhr.status == 200) {
			var score = 0;
			result = JSON.parse(xhr.responseText);
			callback(result);
		}
	});
}

//将数据渲染到页面上
function renderData(arr) {
	//随机题目
	var index = Math.floor(Math.random() * arr.length);
	var musicAudio = document.querySelector("audio");
	var questionBlock = document.querySelector(".question_block");
	var optionSelects = document.querySelectorAll(".option_select");
	//添加音乐的路径
	musicAudio.src = arr[index].audio;
	//渲染题目
	for(var j = 0; j < optionSelects.length; j++) {
		var optionP = optionSelects[j].querySelector("p");
		optionP.innerText = arr[index].item[j];
	}
	musicAudio.play();
}
//音乐播放兼容ios
jQuery(document).ready(function($) {
	audioAutoPlay('ad');
});
function audioAutoPlay(id) {
	var audios = document.getElementById(id),
		play = function() {
			audios.play();
			document.removeEventListener("touchstart", play, false);
		};
	audios.play();
	//兼容微信
	document.addEventListener("WeixinJSBridgeReady", function() {
		play();
	}, false);
	//兼容易信
	document.addEventListener('YixinJSBridgeReady', function() {
		play();
	}, false);
	document.addEventListener("touchstart", play, false);
}

//问题页
var count = 0; //记录用户答对成绩

//问题页顶部灯光颜色变化
function changeColor(cname) {
	var page = cname.slice(-1);
	var img = document.querySelector(cname).querySelector(".img_top").querySelector("img");
	setInterval(function() {
		var img_prefix = img.src.split("img/")[0];
		var img_src = img.src.split("img/")[1];
		var num = img_src.split(".png")[0].slice(-1);
		num++;
		if(num > 5) {
			num = 2;
		}
		img.src = img_prefix + "img/question" + page + "_img" + num + ".png";
	}, 500)
}
changeColor(".top1");
changeColor(".top2");
changeColor(".top3");
changeColor(".top5");

//问题页背景图片的动画切换
function changeBg(cname) {
	var page = cname.slice(-1);
	var img = document.querySelector(cname).querySelector(".img_center").querySelector("img");
	setInterval(function() {
		var img_prefix = img.src.split("img/")[0];
		var img_src = img.src.split("img/")[1];
		var imgSrc1 = "question" + page + "_img.png";
		var imgSrc2 = "question" + page + "_img_2.png";
		if(img_src == imgSrc1) {
			img.src = "img/" + imgSrc2;
		} else {
			img.src = "img/" + imgSrc1;
		}

	}, 500)
}
changeBg(".top3");
changeBg(".top4");
changeBg(".top6");

//更换问题页背景图片
function changeQuesBg() {
	var question_block = document.querySelector(".question_block");
	var top = document.querySelectorAll(".top");
	var index = 0;
	//拿到当前显示的背景图片的下标值
	for(var i = 0; i < top.length; i++) {
		if(top[i].style.display == "block") {
			index = i;
		}
	}
	//随机图片，且不与当前背景图片重复
	var num = Math.floor(Math.random() * 6);
	while(num == index) { //一直取到不与当前背景图片的下标值的num值
		var num = Math.floor(Math.random() * 6);
	}
	for(var i = 0; i < top.length; i++) {
		top[i].style.display = "none";
	}
	top[num].style.display = "block";
	question_block.style.backgroundImage = "url(img/question_bg" + (num + 1) + ".jpg)";
}

//倒计时
function daojishi() {
	var timeBox = document.querySelector(".daojishi");
	var time = document.querySelector(".time");
	var timeEnd = 2;
	time.innerText = timeEnd + "s";
	time.style.color = "#000";
	timeBox.style.animation = "heartBeat 0s infinite";
	var timer = setInterval(function() {
		timeEnd--;
		time.innerText = timeEnd + "s";
		if(timeEnd <= 10) {
			time.style.color = "red";
			timeBox.style.animation = "heartBeat 1s infinite";
		}
		if(timeEnd == 0) { //倒计时结束计算成绩
			clearInterval(timer);
			scoreNum(count);
		}
	}, 1000)
}

//将用户选择的答案与正确答案比较，正确返回1
function answer(arr, i) {
	var musicAudio = document.querySelector("audio");
	var _url = "./music" + musicAudio.src.split("/music")[1];
	var number;
	var count = 0;
	for(var j = 0; j < arr.length; j++) {
		if(arr[j].audio == _url) {
			number = arr[j].answer;
			break;
		}
	}
	var optionSelects = document.querySelectorAll(".option_select");
	var img = document.createElement("img");
	img.classList.add("panduan");
	if(i == number) {
		img.src = "img/question_gou.png";
		optionSelects[i].appendChild(img);
		count++;
	} else {
		img.src = "img/question_cuo.png";
		optionSelects[i].appendChild(img);
	}
	return count;
}

//删除对错图片
function deleteImg(obj) {
	var imgs = obj.querySelectorAll(".panduan");
	var len = imgs.length;
	console.log(imgs)
	setTimeout(function() {
		for(var i=0;i<len;i++){
			imgs[i].remove();
		}
	}, 250)
}

//根据用户答对的题数，输出用户的段位和成绩
function scoreNum(count) {
	var result = document.querySelector(".result");
	var question = document.querySelector(".question");
	var musicAudio = document.querySelector("audio");
	musicAudio.pause(); //暂停音乐
	question.style.display = "none";
	result.style.display = "block";
	var img = document.querySelector(".medal_img");
	var score = document.querySelector(".score_num");
	score.innerText = "猜中" + count + "首";
	if(count > 0 && count <= 5) {
		img.src = "img/medal1.png";
	} else if(count > 5 && count <= 10) {
		img.src = "img/medal2.png";
	} else if(count > 10 && count <= 15) {
		img.src = "img/medal3.png";
	} else if(count > 15 && count <= 20) {
		img.src = "img/medal4.png";
	} else {
		img.src = "img/medal5.png";
	}
}

//结果页
var result_btn_left = document.querySelector(".result_btn_left");
var result_btn_right = document.querySelector(".result_btn_right");
var result = document.querySelector(".result");
var share = document.querySelector(".share");
var preload = document.querySelector(".preload");
var returnBtn = document.querySelector(".return");
//再来一次按钮
result_btn_left.ontouchend = function() {
	var result = document.querySelector(".result");
	var share = document.querySelector(".share");
	var web = document.querySelector(".web");
	result.style.display = "none";
	web.style.display = "flex";
}
//分享到朋友圈按钮
result_btn_right.ontouchend = function() {
	var result = document.querySelector(".result");
	var share = document.querySelector(".share");
	var preload = document.querySelector(".preload");
	result.style.display = "none";
	share.style.display = "block";
}
//分享页中的返回按钮
returnBtn.ontouchend = function() {
	var result = document.querySelector(".result");
	var web = document.querySelector(".web");
	share.style.display = "none";
	result.style.display = "block";
}

//朋友圈排名列表
var resultFriend = document.querySelector(".result_friend");
var resultFriendImg = resultFriend.querySelector("img");
var friendList = resultFriend.querySelector(".friend_list");
var friendListUl = friendList.querySelector("ul");
var friendListLis = friendListUl.querySelectorAll("li");
window.onload = function(){
	friendListUl.style.height = (friendListLis[0].offsetHeight*3)+"px";
	var mouseY;
	friendListUl.addEventListener("touchstart",function(e){
		mouseY = e.clientY;
	})
	friendListUl.addEventListener("touchmove",function(e){
		var mouseYNow = e.clientY;
		console.log(mouseY);
		console.log(mouseYNow);
		console.log(mouseYNow-mouseY);
	})
}
