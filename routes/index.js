var express = require('express');
var request = require('request');
var Projects = require('../models/projects');
var Users = require('../models/users');
var Votes = require('../models/votes');

var Util = require('../util/util');
var checkLogin = Util.checkLogin;

var router = express.Router();

var FB_URL = 'https://graph.facebook.com/me?access_token=';

/* GET home page. */
router.get('/', function(req, res) {
	Projects.find({ approved: true }, function(err, projects){
        var errors = req.session.errs;
		if (err) errors.push(err);
        delete req.session.errs;
		res.render('index', { 
            projects: projects,
            user: req.session.user,
            errs: errors
        });
	});
});

/* GET projects (JSON format) */
router.get('/projects', function(req, res) {
	Projects.find({ approved: true }, function(err, projects){
		if (err) {
            res.send(err);
            return;
        }
        Votes.find({}).populate('user', '_id').exec(function(err, votes) {
            if (err) {
                res.send(err);
                return;
            }
            var votesObj = {};
            for (index in projects) {
                var project = projects[index];
                votesObj[project._id] = [];
            }

            for (index in votes) {
                var vote = votes[index];
                votesObj[vote.project].push(vote);
            }
            res.json({votes: votesObj, projects: projects, user: req.session.user || null });
        });
	});
});

/* Login via FB User Token */
router.post('/login', function(req, res) {
    if (req.body.token) {
        var token = req.body.token;
        request(FB_URL + token, function(err, response, data) {
            if (response.statusCode != 200) {
                res.json({ error: err });
                return;
            }

            // User exists, either login or create a new account.
            var userData = JSON.parse(data);
            Users.count({ _id: userData.id }, function(err, count) {
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
    delete req.session.user;
    res.redirect('/');
});


/* Project display page */
router.get('/project/:pid', function(req, res) {
	Projects.findById(req.params.pid, function(err, project){
		res.render('project', { 
            project: project,
            user: req.session.user,
            err: err ? 'Could not load project' : null
        });
	});
});

router.get('/project/:pid/vote', function(req, res) {
    var user = req.session.user;
    if (!user) {
        res.status(401).json({err: 'Must be logged in to vote!'});
        return;
    }
	Projects.findById(req.params.pid, function(err, project){
        if (!project || err) {
            res.status(404).json({err: err ? err : 'No project found'});
            return;
        }
        Votes.findOneAndRemove(
            { user: user.id, project: project._id }, function(err, vote) {
            if (err) {
                res.json({success: false, error: err});
                return;
            } 
            var voted = false;
            if (!vote) {
                vote = new Votes({ user: user.id, project: project._id });
                vote.save();
                voted = true;
            }
            res.json({voteStatus: voted });
        });
	});
});

/* Create a new project */
router.route('/project')
    .all(function(req, res, next) {
        if (checkLogin('You must be logged in to create a project', req, res, '/')) return;
        next();
    })
    .get(function(req, res) {
        res.render('create-project', { user: req.session.user });
    })
    .post(function(req, res) {
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
                return;
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
