var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var multer  = require('multer')

var port = process.env.PORT || 8080;

mongoose.connect('mongodb://127.0.0.1/traction');

var index = require('./routes/index');
var api = require('./routes/api');
var users = require('./routes/users');
var admin = require('./routes/admin');

var fs = require('fs');
var app = express();

var IMG_MIMES = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/bmp', 'image/svg+xml', 'image/tiff'];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer({ 
    dest: __dirname + '/public/uploads/',
    limits: {fileSize: 2000000},
    onFileUploadStart: function(file, req, res) {
        if (IMG_MIMES.indexOf(file.mimetype) == -1) {
            return false;
        }
    }
}))

app.use(session({                                         
    store: new RedisStore({                               
        host: 'localhost',                                
        port: '6379'                                      
    }),                                                   
    secret: process.env.ADMIN_PASS,
    resave: false,
    saveUninitialized: true,                              
    cookie : {}                                           
}));                                                      

app.use('/', index);
app.use('/profile', users);
app.use('/admin', admin);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            user: req.session.user || null
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        user: req.session.user || null
    });
});

module.exports = app;

app.listen(port);
console.log('Starting server on port: ' + port);
