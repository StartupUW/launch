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
		//Users.findById(req.params.user_id, function(err, user) {
		//	if(err) {
		//		res.send(err);
		//	} else {
				user.fname = req.body.fname;
				user.lname = req.body.lname;
				user.email = req.body.email;
				user.bio = req.body.bio;
				user.major = req.body.bio;
				user.gradyr = req.body.gradyr;
				res.json({message: "User Created!"});
		//	}		
	});

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