// var ObjectID = require('mongodb').ObjectID;
// var mongodb = require('./db');
var mongoose = require('./db.js')
// var markdown = require('markdown').markdown;

var ObjectId = mongoose.Types.ObjectId;

var postSchema = new mongoose.Schema({
	name: String,
	// head: String,
	title: String,
	tags: [String],
	post: String,
	time: {},
	comments: [],
	reprint_info: {},
	pv: Number
}, {
	collection: 'posts'
});

var postModel = mongoose.model('Post', postSchema);


function Post(post) {
	this.name = post.name;
	// this.head = post.head;
	this.title = post.title;
	this.tags = post.tags;
	this.post = post.post;
	// this.time = post.time;
};


//存储一篇文章及其相关信息
Post.prototype.save = function (callback) {
	var date = new Date();
	//存储各种时间格式，方便以后扩展
	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth() + 1),
		day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
		minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" +date.getDate() + " " +date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	}
	//要存入数据库的文档
	var post = {
		name: this.name,
		// head: this.head,
		time: time,
		title: this.title,
		tags: this.tags,
		post: this.post,
		comments: [],
		reprint_info: {
			reprint_from_id: 0,
			reprint_to_id: []
		},
		pv: 0
	};
	var newPost = new postModel(post);
	newPost.markModified('time');
	newPost.markModified('comments');
	newPost.markModified('reprint_info');
	newPost.save(function (err, post) {
		if (err) {
			return callback(err);
		}
		callback(null, post);
	});
};

//一次获取十篇文章及其相关信息
Post.getTen = function (name, page, callback) {
	var conditions = {};//查询条件
	if (name) {
		conditions.name = name;
	}
	postModel.count(conditions, function (err, total) {
	  postModel.find(conditions)
	  // .count(total)
	  .skip((page - 1)*10)
	  .limit(10)
	  .sort({time: -1})
	  .exec(function (err, docs) {
	  	if (err) {
	  		return callback(err);
	  	}
	  	callback(null, docs, total);
	  });
	});  
};

//获取一篇文章及其相关信息
Post.getOne = function (_id, callback) {
	//var post_id = new ObjectId(_id);
	postModel.findByIdAndUpdate(new ObjectId(_id), {$inc: {"pv": 1}}, function(err, doc) {
		if (err) {
			return callback(err);
		}
		callback(null, doc);
	});
};

//返回原始发表的内容 （ markdown 格式）
Post.edit = function(_id, callback) {
	postModel.findById(new ObjectId(_id),function(err, doc) {
		if (err) {
			return callback(err);
		}
		callback(null, doc);
	});
};

//更新一篇文章及其相关信息
Post.update = function(_id, post, callback) {
	postModel.findByIdAndUpdate(new ObjectId(_id),{$set: {post: post}}, function(err) {
		if (err) {
			return callback(err);
		}
		callback(null);
	});
};

//删除一篇文章
Post.remove = function(_id, callback) {
	postModel.findById(new ObjectId(_id),function(err, doc) {
		console.log(doc.reprint_info.reprint_from_id);
		if (doc.reprint_info.reprint_from_id) {
			postModel.findByIdAndUpdate(new ObjectId(doc.reprint_info.reprint_from_id),{$pull: {"reprint_info.reprint_to_id": new ObjectId(_id)}}, function (err) {
				if (err) {
					return callback(err);
				}
			});
		}
		postModel.findByIdAndRemove(new ObjectId(_id),{w: 1}, function (err) {
			if (err) {
				return callback(err);
			}
			callback(null);
		});
	});
};

//返回所有文章存档信息
Post.getArchive = function(callback) {
	postModel
	    .find({},{"name":1, "time":1, "title":1})
	    .sort({time: -1})
	    .exec(function (err, docs) {
	    	if (err) {
	    		return callback(err);
	    	}
	    	callback(null, docs);
	    });
};

//返回所有标签
Post.getTags = function(callback) {
	postModel.distinct("tags", function (err, docs) {
		if (err) {
			return callback(err);
		}
		callback(null, docs);
	});
};

//返回含有特定标签页的所有文章，按日期降序排列
Post.getTag = function(tag, callback) {
	postModel
	    .find({"tags": tag}, {"name":1, "time":1, "title":1})
	    .sort({time: -1})
	    .exec(function (err, docs) {
	    	if (err) {
	    		return callback(err);
	    	}
	    	callback(null, docs);
	    });
};

//返回通过标题关键字查询的所有文章信息，按日期降序排列
Post.search = function(keyword, callback) {
	var pattern = new RegExp(keyword, "i");
	postModel
	    .find({"title": pattern},{"name":1, "time":1, "title":1})
	    .sort({time: -1})
	    .exec(function (err, docs) {
	    	if (err) {
	    		return callback(err);
	    	}
	    	callback(null, docs);
	    });
};

//转载一篇文章
Post.reprint = function(reprint_from_id, reprint_to_id, reprinter, callback) {
    //将转来的文档存入数据库
	postModel.findById(new ObjectId(reprint_from_id), function (err, doc) {
		if (err) {
			return callback(err);
		}
		var date = new Date();
		var time = {
		    date: date,
		    year: date.getFullYear(),
            month: date.getFullYear() + "-" + (date.getMonth() + 1),
            day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
            minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
		}
		var post = {
			    name: reprinter.name,
				// head: this.head,
				time: time,
				title: (doc.title.search(/[转载]/) > -1) ? doc.title : "[转载]" + doc.title,
				tags: doc.tags,
				post: doc.post,
				comments: [],
				reprint_info: {
					reprint_from_id: new ObjectId(reprint_from_id),
					reprint_to_id: []
				},
				pv: 0
			};
		var newPost = new postModel(post);
		newPost.markModified('time');
		newPost.markModified('comments');
		newPost.markModified('reprint_info');
		newPost.save(function (err, post) {
			if (err) {
				return callback(err);
			}
			callback(null, post);
		});
	});
};

//增加被转载文档里的reprint_to_id信息
Post.reprint_info = function(reprint_from_id, reprint_to_id ,callback) {
	postModel.findByIdAndUpdate(new ObjectId(reprint_from_id), {$push: {"reprint_info.reprint_to_id": new ObjectId(reprint_to_id)}}, function (err, doc) {
		if (err) {
			return callback(err);
		}
		callback(null);
	});
};

//嵌入留言
Post.insertComment = function(_id, comment, callback) {
	postModel.findByIdAndUpdate(new ObjectId(_id), {$push: {"comments": comment}}, function (err) {
		if (err) {
			return callback(err);
		}
		callback(null);
	});
};


module.exports = Post;
