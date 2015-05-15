var express = require('express');
var Projects = require('../models/projects');

var router = express.Router();

var ADMIN_PASS = process.env.ADMIN_PASS;

/* Admin Login Page */
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
    
/* Admin console */
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
        if (req.body.hasOwnProperty("id")) {
            Projects.update({ _id: req.body.id }, { approved: true }, function(err, updated) {
                var errors = [];
                if (err) errors.append(err);
                renderProjects(errors, res);
            });
        } else {
            renderProjects(['Did not receive a project id to delete'], res);
        }
   });

/* Admin logout */
router.get('/logout', function(req, res) {
    delete req.session.admin;
    res.redirect('/admin');
});

var renderProjects = function(errors, res) {
     Projects.find({ approved: false }, function(err, projects){
        if (err) errors.append(err);
        res.render('admin-console', { projects: projects, errors: errors });
        return;
    });
}

module.exports = router;
