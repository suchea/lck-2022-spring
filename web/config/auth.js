module.exports = {
    // express의 middleware
    // 사용자가 로그인 되어 있는지 확인한다.
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        // 로그인 안되어 있을 경우 코드 400
        res.status(400).send();
    }, forwardAuthenticated: function (req, res, next) {
        // 사용자가 이미 로그인 되어 있을경우 홈페이지로 이동시킨다.
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    }
};