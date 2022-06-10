const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const hash = require('./password.js');

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'password', passReqToCallback: true }, (req, email, password, done) => {
            // password는 한가지 이므로 id 0으로 고정, username 입력은 받지 않는다.
            bcrypt.compare(password, hash, (err, isMatch) => {
                // 비밀번호의 해쉬값을 비교한뒤, 일치할 경우 id를 설정해준다.
                // 실패할 경우 user의 값은 undefined가 된다.
                if (err) throw err;
                if (isMatch) {
                    return done(null, { id: 0 });
                } else {
                    return done(null, false);
                }
            });
        })
    );

    // 세션 관리
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        done(null, { 'id': id });
    });
};
