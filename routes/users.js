var express = require('express');
var router = express.Router();

// Models
var Projects = require('../models/projects');

router.get('/', function(req, res, next) {
  res.send('User profiles');
});

router.get('/project/:pid', function(req, res){
	Projects.findById(req.params.pid, function(err, project){
		if(err) {
			res.send(err);
		}
		res.render('project', { project : project });
	});
});

router.post('/projects/create', function(req, res){
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