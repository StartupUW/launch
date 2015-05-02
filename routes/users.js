var express = require('express');
var router = express.Router();

// Models
var Projects = require('../models/projects');

router.get('/', function(req, res, next) {
  res.send('User profiles');
});

router.get('/create', function(req, res){
	var project = new Projects();




	res.send('Welcome, submit a new project');
});

module.exports = router;