var express = require('express');
var router = express.Router();

// Models
var Projects = require('../models/projects');

router.get('/', function(req, res, next) {
  res.send('User profiles');
});

router.post('/create', function(req, res){
	var project = new Projects();
	project.name = req.body.project.name;
	project.website = req.body.project.website;
	project.description = req.body.project.desc;
	project.contact.email = req.body.project.email;
	project.contact.phone = req.body.project.phone;
	project.type = req.body.project.type;

	project.save(function(err){
		if(err)
			res.send(err);
		res.json(project);
	});
});

module.exports = router;