var express = require('express');
var router = express.Router();
var Users = require('./models/users');
// Models
var Projects = require('../models/projects');

router.get('/', function(req, res, next) {
  res.send('User profiles');
});

router.route('/users')
	.post(function(req,res) {

	})

module.exports = router;