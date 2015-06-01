/**
 * Startup UW Launch, 2015
 * Index Router - homepage, projects, and logout functionality.
 * 
 * ---------------------------------------------------------------------------
 * Route                    REST Calls      Description
 * ---------------------------------------------------------------------------
 * /                        GET             Render the homepage (all projects)
 * /logout                  GET             Log the current user out.
 * /project                 GET, POST       Render and process form for creating projects
 * /project/:pid/           GET             Display a single project page
 * /project/:pid/update     POST            Update a project
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
var checkLogin = require('../util/util').checkLogin;

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

router.get('/logout', function(req, res) {
    delete req.session.user;
    res.redirect('/');
});

/* Project display page */
router.get('/project/:pid', function(req, res) {
    res.render('project', { 
        projectId: req.params.pid,
        user: req.session.user,
    });
});

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
		console.log(req.files);
		project.tags = 'asdf';
		uploadImg(req.files.image, project.id, function(err, newFile) {
			if(!err) {
				project.images.push(newFile);
				project.save(function(err){
					if(err) {
						res.send(err);
					}
					res.json(project);
				});
			} else {
				res.send(err);
			}
		})
    });

var uploadImg = function(image, id, handle) {
	fs.readFile(image.path, function (err, data) {
	  	var newPath = "./public/uploads/" + id + "." + image.extension;
	  	fs.writeFile(newPath, data, function(err) {
    		handle(err, newPath);
	  	});
	});
};

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
