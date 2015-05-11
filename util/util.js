/* Utility functions */

var checkLogin = function(err, req, res, redirect) {
    if (!req.session.user) {
        req.session.errs = [err];
        res.redirect(redirect);
        return true;
    }
    return false;
};

exports.checkLogin = checkLogin;
