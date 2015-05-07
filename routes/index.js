var express = require('express');
var router = express.Router();
var request = require('request');
var Projects = require('../models/projects');
var Users = require('../models/users');

var APP_TOKEN = '845062025559463|_yVr4ZA8yYT2KViTS3wijNxCYmU';

/* GET home page. */
router.get('/', function(req, res, next) {
	Projects.find({ approved: true }, function(err, projects){
		if(err) res.send(err);
		res.render('index', { projects : projects });
	});
});

router.post('/login', function(req, res) {
    if (req.body.token) {
        var token = req.body.token;
        var url = 'https://graph.facebook.com/debug_token?input_token=' + token + '&access_token=' + APP_TOKEN;
        request(url, function(err, response, body) {
            if (response.statusCode != 200) res.json({error: err})
            Users.count({ _id: body.user_id }, function(err, count) {
                if (err) res.json({error: err});
                if (count == 1) {
                    req.session.user = body.user_id;
                    res.json({user: true});
                } else {
                    req.session.token = body.user_id;
                    res.json({user: false});
                }
                
            });
        });
    } else {
        res.json({success: false});
    }

});

module.exports = router;
