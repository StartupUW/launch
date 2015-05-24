/**
 * Startup UW Launch, 2015
 * Admin Router - admin console and login
 * 
 * ---------------------------------------------------------------------------
 * Route                    REST Calls      Description
 * ---------------------------------------------------------------------------
 * /                        GET             Render the login page or redirect if logged in
 * /console                 GET             Render all unapproved projects
 * /console                 POST            Approve or delete a pending project
 * /logout/:pid/            GET             Log the current admin out
 *
 */

// Express
var express = require('express');
var router = express.Router();

// Models
var Projects = require('../models/projects');

// Authentication
var ADMIN_PASS = process.env.ADMIN_PASS;

var renderProjects = function(errors, res) {
     Projects.find({ approved: false }).populate('members.user', 'fname lname _id').exec(function(err, projects){
        if (err) errors.append(err);
        res.render('admin-console', { projects: projects, errors: errors });
        return;
    });
}

router.route('/')
    .all(function(req, res, next) {
        if (req.session.admin) {
            res.redirect('/admin/console');
            return;
        }
        next();
    })
    .get(function(req, res) {
      res.render('admin', { user: req.session.user });
    })
    .post(function(req, res) {
        if (req.body.password && req.body.password === ADMIN_PASS) {
            req.session.admin = true;
            res.redirect('/admin/console');
            return;
        }
        res.render('admin', { error: true });
    });
    
router.route('/console')
    .all(function(req, res, next) {
        if (!req.session.admin) {
            res.redirect('/admin');
            return;
        }
        next();
    })
    .get(function(req, res) {
        renderProjects([], res);
    })
    .post(function(req, res) {
        if (req.body.action) {
            if (req.body.action == "delete") {
                Projects.remove({ _id: req.body.id }, function(err, updated) {
                    var errors = [];
                    if (err) errors.append(err);
                    renderProjects(errors, res);
                });
            } else {
                Projects.update({ _id: req.body.id }, { approved: true }, function(err, updated) {
                    var errors = [];
                    if (err) errors.append(err);
                    renderProjects(errors, res);
                });
            }
        } else {
            renderProjects(['Did not receive a project id to delete'], res);
        }
   });

router.get('/logout', function(req, res) {
    delete req.session.admin;
    res.redirect('/admin');
});

module.exports = router;
