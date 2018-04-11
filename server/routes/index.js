var express = require('express');
var session = require('express-session');
var router = express.Router();
User = require('../models/user.js');
Diary = require('../models/diary.js');
var session = require('express-session');
var fs = require("fs");
var testuser = new User({
	name:'1',
	password:'1',
	avatar:'images/t1.jpg',
});
testuser.save();
var kls = new User({
	name:'孔令爽',
	password:'konglingshuang',
	avatar:'images/t0.jpg',
});
kls.save();
testuser.adddiary('1','中大一日游','中山大学为孙中山于1924年创办，其前身为国立广东大学。后更名“国立中山大学”、“国立第一中山大学”、后又复前名。1952年经改组，成立中山大学。 大学内环境清幽，校园内的小礼堂、孙中山纪念铜像、黑石屋、惺亭、乙丑进士牌坊、陈寅恪故居、十八先贤铜像、永芳堂、马丁堂、中大北门广场等建筑都具有极高的历史纪念价值。','images/t2.jpg','producer','大学城','200',60,"2017.12.03","2017.12.03");
testuser.adddiary('1','love trip','来场樱花之旅','images/t4.jpg','consumer','山东','200',60,"2017.12.03","2017.12.03");
kls.adddiary('孔令爽','拥抱星月国度的碧海蓝天','土耳其的前世是在历史上响当当的奥斯曼大帝国，这个庞大的帝国曾地跨亚非欧三大洲，扼住大陆交通的咽喉，曾长期是世界上最强大，最繁荣的帝国之一。这个大帝国后来被一点点瘦身，今世的土耳其继承了东罗马帝国的文化和伊斯兰文化，东西方文明在这里得以统合。','images/turkey.jpeg','consumer','土耳其','500',60,"2017.12.03","2017.12.03");
kls.adddiary('孔令爽','贵州镇远','镇远印象悠悠舞阳河，在夜郎古驿道上，孕育一座千年古城～镇远悠悠舞阳河，武断地把镇远一分为二；南岸为卫城，北岸为府城，然后浩荡东去，留下久远，留下传说','images/zhenyuan.jpeg','producer','贵州','100',60,"2017.12.03","2017.12.03");

var ImageDex = 0;
/* GET home page. */
router.get('/cur_user',function(req,res){
	var result = {"name":req.session.user.name,"avatar":req.session.user.avatar};
	res.send(result);
});
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Diary',user:{}});
});
router.get('/reg',function(req,res,next){
	res.render('reg',{title:'注册',user:{}});
});
router.post('/reg',function(req,res,next){
	var user = req.body;
	var name = req.body.name;
	var	password = req.body.password;
	var password_re = req.body.password_repeat;
	if(password_re != password){
		console.log("error 密码不一致");
		return res.redirect('/reg');
	}
	var avatar = req.body.avatar;
	var name1 = ""+ImageDex+".jpg";
	ImageDex++;
	var image = "images/" + name1;
	saveBase64ToFile("public/images/" + name1, req.body.avatar);
	var newUser = new User({
		name: name,
		password: password,
		avatar: image,
	});
	req.session.user = newUser;
	console.log("REQ Session User: " + req.session.user);
	newUser.save();
	console.log(newUser);
	res.redirect('/detail');
});
router.get('/login',function(req,res){
	res.render('login',{title:'登录'});
});
router.post('/login',function(req,res){
	var login_user = new User({
		name: req.body.name,
		password: req.body.password,
		avatar: req.body.avatar,
	});
	if(!login_user.get(req.body.name)){
		return res.redirect('/login');
	}
	if(login_user.get(req.body.name).password != req.body.password){
		return res.redirect('/login');
	}
	req.session.user = login_user.get(req.body.name);
	res.redirect('/detail');
});
router.get('/detail',function(req,res,next){
	var posts = Diary.get(req.session.user.name);
	console.log('post: ',posts);
	res.render('detail',{
		title:'Detail',
		user: req.session.user.name,
		posts:posts
	});
});
// router.post('/detail',function(req,res){

// });
router.get('/list',function(req,res){
	var temp_Diary = new Diary();
	var list = temp_Diary.getProducer();
	console.log("LIST: ",list);
	res.send(list);
});
router.get('/list1',function(req,res){
	var temp_Diary = new Diary();
	var list = temp_Diary.getConsumer();
	console.log("LIST: ",list);
	res.send(list);
});
router.get('/diary',function(req,res,next){
	if(req.session.user != ""){
		res.render('diary',{title:'diary'});
	}
	res.redirect('/');
});
router.post('/diary',function(req,res){
	res.writeHead(200, {"Content-Type": "application/json"});
	if(!req.session.user){
		res.end(JSON.stringify({succeed: 0, error: "Not login!!!"}));
		return;
	}
	var name = ""+ImageDex+".jpg";
	ImageDex++;
	var image = "images/" + name;
	saveBase64ToFile("public/images/" + name, req.body.image);
	new Diary(req.session.user.name,req.body.title,req.body.post,image,req.body.type,req.body.location,req.body.price,req.body.liquidateDamages,req.body.startAt,req.body.endAt).save();
	console.log("After diary save");
	res.end(JSON.stringify({succeed: 1}));
});




router.get('/delete',function(req,res){
	res.render('delete');
});
router.post('/delete',function(req,res){
	req.session.user.deletediary(req.session.user.name,req.body.name);
	res.redirect('/detail');
});
router.get('/logout',function(req,res){
	req.session.user = null;
	res.redirect('/');
});
function change(img1){
	img1.onchange = function () {
        var oFReader = new FileReader();
        oFReader.readAsDataURL(this.files[0]);
        oFReader.onload = function (oFREvent) {
            alert(oFREvent.target.result);
        };
    }
}

function saveBase64ToFile(path, data){
	var buffer = new Buffer(data,'base64');
	fs.writeFile(path, buffer,  "binary", function(err) { });
}

module.exports = router;
