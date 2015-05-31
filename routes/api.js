/**
 * Startup UW Launch, 2015
 * API Router - requests with only JSON responses
 * 
 * ---------------------------------------------------------------------------
 * Route                    REST Calls      Description
 * ---------------------------------------------------------------------------
 * /login                   POST            Authenticate user via FB token
 * /users                   GET             Retrieve all users
 * /project                 POST            Submit and process a new project
 * /projects                GET             Retrieve projects and their votes
 * /project/:pid/vote       POST            Toggle the vote for a project
 *
 */

// Express
var express = require('express');
var router = express.Router();

// Models
var Projects = require('../models/projects');
var Users = require('../models/users');
var Votes = require('../models/votes');

// Utility
var request = require('request');
var handleError = require('../util/util').handleError;

var FB_URL = 'https://graph.facebook.com/';

var graphAPI = function(route, token) {
    return FB_URL + route + '?access_token=' + token;
}

router.post('/login', function(req, res) {
    if (req.body.token) {
        var token = req.body.token;
        request(graphAPI('me', token), function(err, response, data) {
            if (err || response.statusCode != 200) return handleError(err, res, true);

            // User exists, either login or create a new account.
            var userData = JSON.parse(data);
            Users.findOne({ _id: userData.id }, function(err, user) {
                if (err) return handleError(err, res, true);

                // Check whether user exists in our system.
                if (user) {
                    req.session.user = user;
                    res.json({ user: true });
                } else {
                    var picUrl = graphAPI('me/picture', token) + '&width=200&height=200';
                    request(picUrl, function(err, response, data) {
                        if (err || response.statusCode != 200) return handleError(err, res, true);
                        userData.picture = response.request.uri.href;
                        req.session.newUser = userData;
                        res.json({ user: false });
                    });
                }
            });
        });
    } else {
        res.status(400).json({ err: 'Auth token required' });
    }
});

router.post('/project', function(req, res) {
    if (!req.session.user) {
        res.status(401).json({ error: 'You must be logged in to create a project.'});
        return;
    }
    var project = new Projects();
    project.name = req.body.name;
    project.description = req.body.description;
    project.type = req.body.type;
    project.members = JSON.parse(req.body.members);
    if (req.body.website) project.website = req.body.website;
    if (req.body.fbPage) project.fbPage = req.body.fbPage;
    if (req.body.hiring) project.hiring = req.body.hiring;
    if (req.body.tags) project.tags = JSON.parse(req.body.tags);
    if (req.files.logo) project.images = [req.files.logo.name];
    project.save(function(err, project) {
        if (err) return handleError(err, res, true);
        res.json({ success: true });
    })
});

router.get('/users', function(req, res) {
    Users.find({}, '_id fname lname picture', function(err, users) {
        if (err) return handleError(err, res, true);
        res.json({ users: users, user: req.session.user });
        return;
    });
});

router.get('/projects', function(req, res) {
	Projects.find({ approved: true }, function(err, projects){
		if (err) return handleError(err, res, true);
        Votes.find({}, 'project user').populate('user', '_id').exec(function(err, votes) {
            if (err) return handleError(err, res, true);

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

router.get('/project/:pid', function(req, res) {
    Projects.findById(req.params.pid).populate('members.user').exec(function(err, project){
        if (err || !project) return handleError(err, res, true, 404, 'Project not found');
        Votes.find({project: req.params.pid}).populate('user', 'fname lname picture').exec(function(err, votes) {
            if (err) return handleError(err, res, true);
            res.json({
                project: project,
                votes: votes,
                user: req.session.user || null,
            });;
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
        if (err) return handleError(err, res, true);
        if (!project || !project.approved) {
            res.status(404).json({ err: 'No project found'});
            return;
        }
        Votes.findOneAndRemove({ user: user._id, project: project._id }, function(err, vote) {
            if (err) return handleError(err, res, true);

            var voted = false;
            if (!vote) {
                vote = new Votes({ user: user._id, project: project._id });
                vote.save();
                voted = true;
            }
            res.json({ voteStatus: voted });
        });
	});
});

module.exports = router;
