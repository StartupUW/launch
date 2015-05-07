var express = require('express');
var router = express.Router();
var Users = require('../models/users');

router.get('/', function(req, res, next) {
  res.send('User profiles');
});

router.route('/create')
	.post(function(req,res) {
		var user = new Users();
        var userData = req.session.newUser;
        user.uid = userData.id;
		user.fname = userData.first_name;
		user.lname = userData.last_name;
		user.email = req.body.email;
		user.bio = req.body.bio;
		user.major = req.body.major;
		user.gradyr = req.body.gradyr;
		user.save(function(err) {
			if(err) res.send(err);
            req.session.user = userData;
            res.redirect('/');
		});	
	})

router.route('/:user_id')
    .get(function(req, res) {
        Users.findOne({ uid: req.params.user_id }, function(err, profile) {
            if(err) res.send(err);
            res.render('profile', { profile: profile, user: req.session.user });
        });
    })
	.put(function(req,res) {
		Users.findById(req.params.user_id, function(err, user) {
			if(err) res.send(err);
			if(req.body.fname) user.fname = req.body.fname;
			if(req.body.lname) user.lname = req.body.lname;
			if(req.body.email) user.email = req.body.email;
			if(req.body.bio) user.bio = req.body.bio;
			if(req.body.major) user.major = req.body.major;
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


module.exports = router;
