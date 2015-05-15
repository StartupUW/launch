/*
 * Startup UW Launch, 2015
 * Utility functions for misc. tasks (user checking, error handling).
 */

var checkLogin = function(err, req, res, redirect) {
    if (!req.session.user) {
        req.session.errs = [err];
        res.redirect(redirect);
        return true;
    }
    return false;
};

var handleError = function(err, res, json, statusCode, msg) {
    if (json) {
        if (statusCode && msg) {
            res.status(statusCode).json({ err: msg });
            return true;
        }
        res.status(500).json({ err: err });
        return true;
    }
    res.status(500).render('error', { error: err });
    return true;
}

exports.checkLogin = checkLogin;
exports.handleError = handleError;
