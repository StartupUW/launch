var express = require('express');
var request = require('request');
var Projects = require('../models/projects');
var Users = require('../models/users');

var router = express.Router();

var FB_URL = 'https://graph.facebook.com/me?access_token=';

/* GET home page. */
router.get('/', function(req, res) {
	Projects.find({ approved: true }, function(err, projects){
		if(err) res.send(err);
		res.render('index', { projects: projects, user: req.session.user });
	});
});

/* GET projects (JSON format) */
router.get('/projects', function(req, res) {
	Projects.find({ approved: true }, function(err, projects){
		if(err) res.send(err);
		res.json({ projects: projects });
	});
});

/* Login via FB User Token */
router.post('/login', function(req, res) {
    if (req.body.token) {
        var token = req.body.token;
        request(FB_URL + token, function(err, response, data) {
            if (response.statusCode != 200) res.json({ error: err })

            // User exists, either login or create a new account.
            var userData = JSON.parse(data);
            Users.count({ uid: userData.id }, function(err, count) {
                if (err) res.json({ error: err });
                // Check whether user exists in our system.
                if (count == 1) {
                    req.session.user = userData;
                    res.json({ user: true });
                } else {
                    req.session.newUser = userData;
                    res.json({ user: false });
                }
            });
        });
    } else {
        res.json({ success: false });
    }
});

/* Logout */
router.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
});


/* Project display page */
router.get('/project/:pid', function(req, res){
	Projects.findById(req.params.pid, function(err, project){
		if(err) res.send(err);
		res.render('project', { project : project, user : req.session.user });
	});
});

/* Create a new project */
router.post('/project/create', function(req, res) {
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

/* Update an existing project */
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
