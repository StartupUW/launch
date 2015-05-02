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

module.exports = router;