var express = require('express');
var router = express.Router();
var Users = require('../models/users');
var Votes = require('../models/votes');
var Projects = require('../models/projects');

router.route('/')
    .get(function(req, res, next){
        Users.findById(req.session.user._id, function(err, me){
            if(err) {
                res.send(err);
            }
            Votes.find({ user: me._id }).populate('project', '_id name images').exec(function(err, votes) {
                Projects.find({ "members.user" : req.session.user._id }, function(err, projects){
                    res.render('profile', { votes: votes, profile: me, projects : projects, user: req.session.user });
                });
            });
        });
    })
    .put(function(req, res, next){

    });

router.route('/create')
	.post(function(req,res) {
		var user = new Users();
        var userData = req.session.newUser;
        user._id = userData.id;
		user.fname = userData.first_name;
		user.lname = userData.last_name;
        user.picture = userData.picture;
		user.email = req.body.email;
		user.bio = req.body.bio;
		user.major = req.body.major;
		user.gradyr = req.body.gradyr;
		user.link.label = req.body.link.label;
		user.link.url = req.body.link.url;
		user.link.visible = req.body.link.visible;
		user.save(function(err){
			if(err) {
				res.send(err);
			}
				res.render('user', {user: user});
		});	
	});

router.route('users/:user_id')
	.get(function(req,res) {
		Users.findById(req.params.user_id, function(err, user) {
			if(err) {res.render('user', {err: err})};
			res.render('user', {user: user});
		});
		user.save(function(err) {
			if(err) { 
                res.send(err); 
                return;
            }
            req.session.user = user;
            res.redirect('/');
		});	
	});

router.route('/:user_id')
    .get(function(req, res) {
        if(req.params.user_id  == req.session.user._id){
            res.redirect('/profile'); return;
        }
        Users.findOne({ _id: req.params.user_id }, function(err, profile) {
            if(err || !profile) { 
                res.json(err);
                return;
            }
            Votes.find({ user: profile._id }).populate('project', '_id name images').exec(function(err, votes) {
                Projects.find({ "members.user" : req.session.user._id }, function(err, projects) {
                    console.log(projects);
                    res.render('profile', { votes: votes, profile: profile, projects : projects, user: req.session.user });
                });
            });
        });
    });
module.exports = router;
