var express = require('express');
var router = express.Router();
var request = require('request');
var Projects = require('../models/projects');
var Users = require('../models/users');

var FB_URL = 'https://graph.facebook.com/me?access_token=';


/* GET home page. */
router.get('/', function(req, res, next) {
	Projects.find({ approved: true }, function(err, projects){
		if(err) res.send(err);
		res.render('index', { projects : projects, user : req.session.user });
	});
});

router.post('/login', function(req, res) {
    if (req.body.token) {
        var token = req.body.token;
        request(FB_URL + token, function(err, response, data) {
            if (response.statusCode != 200) res.json({error: err})
            var userData = JSON.parse(data);
            Users.count({ uid: userData.id }, function(err, count) {
                if (err) res.json({error: err});
                // Check whether user exists in our system.
                if (count == 1) {
                    req.session.user = userData;
                    res.json({user: true});
                } else {
                    req.session.newUser = userData;
                    res.json({user: false});
                }
            });
        });
    } else {
        res.json({success: false});
    }
});

router.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
});

router.get('/project/:pid', function(req, res){
	Projects.findById(req.params.pid, function(err, project){
		if(err) {
			res.send(err);
		}
		res.render('project', { project : project, user : req.session.user });
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
