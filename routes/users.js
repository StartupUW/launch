var express = require('express');
var router = express.Router();

// Models
var Projects = require('../models/projects');

router.get('/', function(req, res, next) {
  res.send('User profiles');
});

router.post('/create', function(req, res){
	var project = new Projects();
	project.name = req.body.name;
	project.website = req.body.website;
	project.description = req.body.desc;
	project.contact.email = req.body.email;
	project.contact.phone = req.body.phone;
	project.type = req.body.type;

	project.save(function(err){
		if(err) {
			res.send(err);
		}
		res.json(project);
	});
});

module.exports = router;