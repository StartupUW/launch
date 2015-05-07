var express = require('express');
var router = express.Router();
var Projects = require('../models/projects');

/* GET home page. */
router.get('/', function(req, res, next) {
	Projects.find({ approved: true }, function(err, projects){
		if(err) res.send(err);
		res.render('index', { projects : projects });
	});
});

module.exports = router;
