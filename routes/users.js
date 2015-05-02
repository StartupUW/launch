var express = require('express');
var router = express.Router();
var Users = require('../models/users');
// Models
var Projects = require('../models/projects');

router.get('/', function(req, res, next) {
  res.send('User profiles');
});

router.route('/users')
	.post(function(req,res) {
		var user = new Users();
		user.fname = req.body.fname;
		user.lname = req.body.lname;
		user.email = req.body.email;
		user.bio = req.body.bio;
		user.major = req.body.bio;
		user.gradyr = req.body.gradyr;
		user.link.label = req.body.link.label;
		user.link.url = req.body.link.url;
		user.link.visible = req.body.link.visible;
		user.save(function(err){
			if(err) {
				res.send(err);
			}
				res.json(user);
		});	
	})

router.put('/users:user_id', function(req,res) {
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

router.post('/create', function(req, res){
	var project = new Projects();
	project.name = req.body.name;
	project.website = req.body.website;
	project.description = req.body.desc;
	project.contact.email = req.body.email;
	project.contact.phone = req.body.phone;
	project.type = req.body.type;

	project.save(function(err){
		if(err) {
			res.send(err);
		}
		res.json(project);
	});
});

module.exports = router;