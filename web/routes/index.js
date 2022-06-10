var express = require('express');
var ejs_api = require('../model/ejs_api');
var api = require('../model/api');
var router = express.Router();
const passport = require('passport');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// 실질적인 데이터를 주는 페이지 : tid, pid, cid, c 는 필터링에 사용된다.
router.get('/page/:page', (req, res) => {
  // 경기 데이터는 20개씩 로드한다
  api.getSets(req.params.page, 20, req.query.tid, req.query.pid, req.query.cid, req.query.c).then(data =>{
    if(data.length>0)
      res.render('list', {data:data, api:ejs_api, layout:false, user: req.user});
    else
      res.status(400).send();
  })
});

// 로그인 페이지
router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('login');
})

// 로그아웃 페이지
router.get('/logout', (req, res) => {
  req.logout((err)=>{
    console.log(err);
  });
  res.redirect('/');
});

// 로그인 요청 페이지 : post로 정보를 받는다
router.post('/login', passport.authenticate('local'), (req, res, next) => {
  res.status(200).send();
});

// 경기 데이터 입력 페이지 : 인증된 사용자만 접근할 수 있다.
router.get('/insert', ensureAuthenticated, (req, res) => {
  api.getTeams().then(data =>{
    res.render('insert', {teams: data, layout:false});
  })
});

// 경기 데이터 입력 요청 페이지 : 인증된 사용자만 접근할 수 있다.
router.post('/insert', ensureAuthenticated, (req, res) => {
  api.insertSet(req.body).then(data =>{
    if(data)
      res.status(200).send();
    else
      res.status(400).send();
  });
});

// 경기 데이터 입력 페이지에서 팀 선택시 팀별 플레이어 목록 제공하는 페이지 : 인증된 사용자만 접근할 수 있다.
router.get('/insert/teaminfo/:tid', ensureAuthenticated, (req, res) => {
  api.getPlayersFromTeam(req.params.tid).then(data =>{
    res.render('playerStats', {players: data, side: req.query.side, api:ejs_api, layout:false});
  });
  
});

// 경기 데이터 삭제 요청 페이지 : 인증된 사용자만 접근할 수 있다.
router.get('/delete/:mid/:sid', ensureAuthenticated, (req, res) => {
  api.deleteSet(req.params.mid, req.params.sid).then((data) => {
    if(data)
      res.status(200).send();
    else
      res.status(400).send();
  });
});

// 홈페이지
router.get('/', (req, res) => {
  res.render('index', {user: req.user});
});


module.exports = router;
