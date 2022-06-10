var express = require('express');
var path = require('path');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const session = require('express-session');
require('./config/passport')(passport);

// express 초기화
const app = express();

// post 요청에서 body parser 초기화 
app.use(express.urlencoded());

// 세션 초기화
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// 렌더링 엔진을 EJS로 설정
app.use(expressLayouts);
app.set('view engine', 'ejs');

// '/public' 폴더 서비스
app.use('/public', express.static(__dirname + '/public'));

// '/'에 대한 라우터 지정
app.use('/', require('./routes/index'));

// 포트 3000번에 서비스 시작
app.listen(3000, '0.0.0.0');

module.exports = app;
