var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');
var express = require('express');
var router = express.Router();

/* 路由规划
/ :首页
/login :用户登录
/reg :用户注册
/post :发表文章
/logout :登出
*/
router.get('/', function(req, res, next) {
	//判断是否为第一页， 并把请求的页数转换成 number 类型
	var page = req.query.p ? parseInt(req.query.p) : 1;
	//查询并返回第 page 页的 10 篇文章
	Post.getTen(null, page, function (err, posts, total) {
		if (err) {
			posts = [];
		}
		res.render('index', {
			title: '主页',
			posts: posts,
			page: page,
			lastPage: Math.floor(total/10) + 1,
			isFirstPage: (page - 1) == 0,
			isLastPage: ((page - 1) * 10 + posts.length) == total,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res, next) {
	res.render('reg', { 
		title: '帐号注册',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res, next) {
	var name = req.body.name,
	    password = req.body.password,
	    password_re = req.body['password-repeat'];
	//检验用户两次输入的密码是否一致
	if (password_re != password) {
		req.flash('error', '两次输入的密码不一致！');
		return res.redirect('/reg');//返回注册页
	}
	//生成密码的 MD5 值
	var md5 = crypto.createHash('md5'),
	    password = md5.update(req.body.password).digest('hex');
	var newUser = new User({
		name: name,
		password: password,
		email: req.body.email
		// head: head
	});
	//检查用户名是否已经存在
	User.get(newUser.name, function (err, user) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');//返回主页
		}
		if (user) {
			req.flash('error', '用户已存在！');
			return res.redirect('/reg');//返回注册页
		}
		//如果不存在则新增用户
		newUser.save(function (err, user) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/');//注册失败返回主页
			}
			req.session.user = newUser;//用户信息存入session
			req.flash('success', '注册成功！');
			res.redirect('/');//注册成功后返回主页
		});
	});
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res, next) {
	res.render('login', { 
		title: '帐号登录',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res, next) {
	//生成密码的 MD5 值
	var md5 = crypto.createHash('md5'),
	    password = md5.update(req.body.password).digest('hex');
	//检查用户是否存在
	User.get(req.body.name, function (err, user) {
		if (!user) {
			req.flash('error', '用户不存在！');
			return res.redirect('/login');//用户不存在则跳转到登录页
		}
		//检查密码是否一致
		if (user.password != password) {
			req.flash('error', '密码错误！');
			return res.redirect('/login');//密码错误则跳转到登录页
		}
		//用户名密码都匹配后，将用户信息存入 session
		req.session.user = user;
		req.flash('success', '登录成功！');
		res.redirect('/');//登录成功后跳转到主页
	});
});

router.get('/post', checkLogin);
router.get('/post', function(req, res, next) {
	res.render('post', { 
		title: '发表',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/post', checkLogin);
router.post('/post', function(req, res, next) {
	var currentUser = req.session.user,
	    tags = [req.body.tag1, req.body.tag2, req.body.tag3];
	var newPost = new Post({
	    	name: currentUser.name, 
	    	// head: currentUser.head, 
	    	title: req.body.title, 
	    	tags: tags, 
	    	// time: time, 
	    	post: req.body.post});
	newPost.save(function (err, post) {
		if (err) {
			req.flash('error', err);
			console.log('err:'+err);
			return res.redirect('/');
		}
		req.flash('success', "发表成功！");
		res.redirect('/');//发表成功跳转到主页
	});
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res, next) {
	req.session.user = null;
	req.flash('success', '登出成功！');
	res.redirect('/');//登出成功后跳转到主页
});

router.get('/upload', checkLogin);
router.get('/upload', function(req, res, next) {
	res.render('upload', {
		title: '文件上传',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

// 图片未存储进数据库，后面应该建立类似posts的对象来完善功能，并提示错误
router.post('/upload', checkLogin);
router.post('/upload', 
	function(req, res, next) {
	req.flash('success', '文件上传成功！');
	res.redirect('/upload');
});

router.get('/archive', function (req, res, next) {
	Post.getArchive(function (err, posts) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('archive', {
			title: '存档',
			posts: posts,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

router.get('/tags', function (req, res, next) {
	Post.getTags(function (err, posts) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('tags', {
			title: '标签',
			posts: posts,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

router.get('/tags/:tag', function(req, res, next) {
	Post.getTag(req.params.tag, function (err, posts) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('tag', {
			title: req.params.tag,
			posts: posts,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

router.get('/links', function (req, res, next){
	res.render('links', {
		title: '友情链接',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.get('/search', function(req, res, next) {
	Post.search(req.query.keyword, function (err, posts) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('search', {
			title: req.query.keyword,
			posts: posts,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

router.get('/u/:name', function(req, res, next) {
	var page = req.query.p ? parseInt(req.query.p) : 1;
	//检查用户是否存在
	User.get(req.params.name, function (err, user) {
		if (!user) {
			req.flash('error', '用户不存在！');
			return res.redirect('/');//用户不存在则跳转到主页
		}
		//查询并返回该用户第 page 页的 10 篇文章
		Post.getTen(user.name, page, function (err, posts, total) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('user', {
				title: user.name,
				posts: posts,
				page: page,
				lastPage: Math.floor(total/10) + 1,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + posts.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
});

router.get('/p/:_id', function(req, res, next) {
	Post.getOne(req.params._id, function (err, post) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('article', {
			title: post.title,
			post: post,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

router.post('/p/:_id', function(req, res, next) {
	var date = new Date(),
	    time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var md5 = crypto.createHash('md5');
    if (req.session.user) {
        var email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
            head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
        var comment = {
        		name: req.body.name,
        		head: head,
        		email: req.body.email,
        		website: req.body.website,
        		time: time,
        		content: req.body.content
        };
    } else {
        // var email_MD5 = md5.update("470375124@qq.com".toLowerCase()).digest('hex'),
        //     head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
        var comment = {
        		name: "游客"+Math.floor((Math.random()*1000)),//随机游客序列号
        		head: "../images/miyo.jpg",
        		email: "470375124@qq.com",
        		website: "http://www.baidu.com",
        		time: time,
        		content: req.body.content
        };
    }
	var newComment = new Comment(comment);
	Post.insertComment(req.params._id, newComment, function (err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('back');
		}
		req.flash('success', '留言成功!');
		res.redirect('back');
	});
});

router.get('/edit/:_id', checkLogin);
router.get('/edit/:_id', function(req, res, next) {
	Post.edit(req.params._id, function (err, post) {
		if (err) {
			req.flash('error', err);
			return res.redirect('back');
		}
		res.render('edit', {
			title: '编辑',
			post: post,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

router.post('/edit/:_id', checkLogin);
router.post('/edit/:_id', function(req, res, next) {
	Post.update(req.params._id, req.body.post, function (err) {
		var url = encodeURI('/p/' + req.params._id);
		if (err) {
			req.flash('error', err);
			return res.redirect(url);//出错！返回文章页
		}
		req.flash('success', '修改成功！');
		res.redirect(url);//成功！返回文章页
	});
});

router.get('/remove/:_id', checkLogin);
router.get('/remove/:_id', function(req, res, next) {
	Post.remove(req.params._id, function (err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('back');
		}
		req.flash('success', '删除成功！');
		res.redirect('/');
	});
});

router.get('/reprint/:_id', checkLogin);
router.get('/reprint/:_id', function(req, res, next) {
	Post.edit(req.params._id, function (err, post) {
		if (err) {
			req.flash('error', err);
			return res.redirect('back');
		}
		Post.reprint(req.params._id, post._id, req.session.user, function (err, post) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			Post.reprint_info(req.params._id, post._id, function (err) {
				if (err) {
					return callback(err);
				}
				req.flash('success', '转载成功！');
		     	var url = encodeURI('/p/' + post._id);
			    //跳转到转载后的文章页面
			    res.redirect(url);
			});
		});
	});
});

router.use(function(req, res) {
	res.render("404");
});


function checkLogin (req, res, next) {
	if (!req.session.user) {
		req.flash('error', '未登录！');
		res.redirect('/login');
	}
	next();
}

function checkNotLogin (req, res, next) {
	if (req.session.user) {
		req.flash('error', '已登录！');
		res.redirect('back');//返回之前的页面
	}
	next();
}

module.exports = router;
