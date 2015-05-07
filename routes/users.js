var express = require('express');
var router = express.Router();

// Models
var Users = require('../models/users');
var Projects = require('../models/projects');

router.get('/', function(req, res, next) {
  res.send('User profiles');
});

router.get('/project/:pid', function(req, res){
	Projects.findById(req.params.pid, function(err, project){
		if(err) {
			res.send(err);
		}
		res.render('project', { project : project });
	});
});

router.route('/create')
	.post(function(req,res) {
		var user = new Users();
		user.fname = req.body.fname;
		user.lname = req.body.lname;
		user.email = req.body.email;
		user.bio = req.body.bio;
		user.major = req.body.bio;
		user.gradyr = req.body.gradyr;
        // user.link.label = req.body.link.label;
		// user.link.url = req.body.link.url;
		// user.link.visible = req.body.link.visible;
        user._id = req.session.token;
		user.save(function(err){
			if(err) {
				res.send(err);
			} else {
				res.json(user);
            }
		});	
	})

router.route('users/:user_id')
	.put(function(req,res) {
		Users.findById(req.params.user_id, function(err, user) {
			if(err) res.send(err);
			if(req.body.fname) user.fname = req.body.fname;
			if(req.body.lname) user.lname = req.body.lname;
			if(req.body.email) user.email = req.body.email;
			if(req.body.bio) user.bio = req.body.bio;
			if(req.body.major) user.moajor = req.body.major;
			if(req.body.gradyr) user.gradyr = req.body.gradyr;
			if(req.body.link.label) user.link.label = req.body.link.label;
			if(req.body.link.url) user.link.url = req.body.link.url;
			if(req.body.link.visibility) user.link.visibility = req.body.link.visibility;
			user.save(function(err) {
				if(err) res.send(err);
				res.json({message: 'User updated!'});
			});
		});
	})

	.delete(function(req,res) {
		Users.remove({
			_id : req.params.user_id
		}, function(err, user) {
			if(err) res.send(err);
			res.json({message: 'User deleted'});
		});
	});


router.post('/projects/create', function(req, res) {
	var project = new Projects();
	project.name = req.body.name;
	project.website = req.body.website;
	project.description = req.body.desc;
	project.contact.email = req.body.email;
	project.contact.phone = req.body.phone;
	project.type = req.body.type;
	project.tags = req.body.tags.split(/,[ \t]*/);

	project.save(function(err){
		if(err) {
			res.send(err);
		}
		res.json(project);
	});
});

router.put('/project/:pid/update', function(req, res) {
	Projects.findById(req.params.pid, function(err, project){
		if(err) {
			res.send(err);
		}
		project.name = req.body.name || project.name;
		project.website = req.body.website || project.website;
		project.description = req.body.desc || project.description;
		project.contact.email = req.body.email || project.contact.email;
		project.contact.phone = req.body.phone || project.contact.phone;
		project.type = req.body.type || project.type;
		project.tags = req.body.tags || project.tags;

		project.save(function(err){
			if(err) {
				res.send(err);
			}
			res.json(project);
		});
	});
});
module.exports = router;
