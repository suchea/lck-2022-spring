const db = require('./db');
// league of legends 게임에 존재하는 챔피언(캐릭터) 목록이다.
const champions = ['아트록스', '아리', '아칼리', '아크샨', '알리스타', '아무무', '애니비아', '애니', '아펠리오스', '애쉬', '아우렐리온 솔', '아지르', '바드', '블리츠크랭크', '브랜드', '브라움', '케이틀린', '카밀', '카시오페아', '초가스', '코르키', '다리우스', '다이애나', '드레이븐', '문도 박사', '에코', '엘리스', '이블린', '이즈리얼', '피들스틱', '피오라', '피즈', '갈리오', '갱플랭크', '가렌', '나르', '그라가스', '그레이브즈', '그웬', '헤카림', '하이머딩거', '일라오이', '이렐리아', '아이번', '잔나', '자르반 4세', '잭스', '제이스', '진', '징크스', '카이사', '칼리스타', '카르마', '카서스', '카사딘', '카타리나', '케일', '케인', '케넨', '카직스', '킨드레드', '클레드', '코그모', '르블랑', '리 신', '레오나', '릴리아', '리산드라', '루 시안', '룰루', '럭스', '말파이트', '말자하', '마오카이', '마스터 이', '미스 포츈', '오공', '모데카이저', '모르가나', '나미', '나서스', '노틸러스', '니코', '니달리', '녹턴', '누누와 윌럼프', '올라프', '오리아나', '오른', '판테온', '뽀삐', ' 파이크', '키아나', '퀸', '라칸', '람머스', '렉사이', '렐', '레나타 글라스크', '레넥톤', '렝가', '리븐', '럼블', '라이즈', '사미라', '세주아니', '세나', '세라핀', '세트', '샤코', '쉔', '쉬바나', '신지드', '사이 온', '시비르', '스카너', '소나', '소라카', '스웨인', '사일러스', '신드라', '탐 켄치', '탈리야', '탈론', '타릭', '티모', '쓰레쉬', '트리스타나', '트런 들', '트린다미어', '트위스티드 페이트', '트위치', '우디르', '우르곳', '바루스', '베인', '베이가', '벨코즈', '벡스', '바 이', '비에고', '빅토르', '블라디미르', '볼리베어', '워윅', '자야', '제라스', '신 짜오', '야스오', '요네', '요릭', '유미', '자크', '제드', '제리', '직스', '질리언', '조이', '자이라'];
const comparator = ['AND', 'OR'];

// page 번째 페이지에 count 개의 경기 데이터를 반환한다 : 여기에 tid, pid, cid, c에 해단하는 필터를 적용한다.
async function getSets(page, count, tid, pid, cid, c) {
  // matches와 sets와 play를 join한다
  sets = await db.query(`SELECT distinct s.sid,s.blue_team,s.red_team,s.blue_win,s.duration,s.blue_kill,s.red_kill,m.mid,m.\`day\`,m.\`date\`,m.match_name FROM sets s inner join matches m on s.mid=m.mid inner join play p on s.mid=p.mid and s.sid=p.sid${generateFilter(tid, pid, cid, c)}order by m.\`day\` asc, m.match_name asc, s.sid asc limit ${count} offset ${(page <= 0 ? 0 : page-1)*count}`);
  let data = [];
  // 각 set에 추가적인 정보를 첨부한다.
  for(let i=0; i<sets.length; i++){
    let row = sets[i];

    // 팀별 정보
    row['blue'] = await getTeamData(row.blue_team);
    row['red'] = await getTeamData(row.red_team);

    // 해당 세트에 참여한 플레이어를 불러온다 (정렬됨: 블루 -> 레드, 탑 -> 서폿)
    let players = await getPlayers(row.mid, row.sid);
    row['players'] = players;

    data.push(row);
  }
  return data;
}

// 팀 목록을 불러온다
async function getTeams(){
  teams = await db.query(`SELECT tid, team_name from team order by tid asc`);
  return teams;
}

// (tid)에 해당하는 팀의 플레이어 목록을 가져온다
async function getPlayersFromTeam(tid){
  players = await db.query(`SELECT pid, username from player where tid=${tid} order by username asc`);
  return players;
}

// getSets 함수의 쿼리에서 where 문을 생성한다 : 입력된 필터값을 where 문으로 변경해준다. 필터가 없을경우 공백을 반환한다.
function generateFilter(tid, pid, cid, c){
  q = '';
  if(tid != undefined && tid != -1){
    q+=` ${comparator[c]} (s.blue_team=${tid} or s.red_team=${tid})`
  }
  if(pid != undefined && pid != -1){
    q+=` ${comparator[c]} p.pid=${pid}`
  }
  if(cid != undefined && cid>-1 && cid < champions.length){
    q+=` ${comparator[c]} p.champion="${champions[cid]}"`
  }
  if(q.length == 0)
    return ' ';
  q = q.substring(c==0 ? 4 : 3);
  return ` WHERE${q} `;
}

// (tid) 에 해당하는 팀 정보를 가져온다.
async function getTeamData(tid){
  data = await db.query(`SELECT * from team where tid=${tid}`);
  return data[0];
}

// (mid, sid) 에 해당하는 play와 player를 join 하여 해당 set에 참가한 player 정보를 가져온다.
async function getPlayers(mid, sid){
  data = await db.query(`SELECT champion, ban, username, kills, death, assist FROM sets s inner join play p on s.mid=p.mid and s.sid=p.sid inner join player l on p.pid=l.pid where s.mid=${mid} and s.sid=${sid} order by p.side asc, l.position asc;`);
  return data;
}

// (mid, sid) 에 해당하는 세트를 삭제한다. mid가 empty할 경우 해당 경기도 삭제한다.
async function deleteSet(mid, sid){
  // set 삭제 : play는 자동삭제된다 (on delete cascade)
  await db.query(`delete from sets where mid=${mid} and sid=${sid}`);
  // mid 비었는지 확인
  data = await db.query(`select count(*) from sets where mid=${mid}`);
  // 비었을 경우 삭제
  if(data[0]['count(*)'] == 0){
    await db.query(`delete from matches where mid=${mid}`);
  }
  return true;
}

// 경기 set 를 추가한다 : 정보는 d 에 담겨있다.
async function insertSet(d){
  // match 있는지 확인
  let date = `2022-${d.date_m}-${d.date_d}`;
  let mid = await db.query(`select mid from matches where match_name="${d.match_name}" and day=${d.day}`);
  if(mid.length>0){
    //있음
    mid = mid[0].mid;
  }else{
    //없음: 새로 입력
    mid = await db.query(`insert into matches (match_name, day, date) values("${d.match_name}", ${d.day}, "${date}")`);
    mid = mid.insertId;
  }
  // mid 받기
  
  // sid 이미 있는지 확인
  let sid = await db.query(`select COUNT(*) from sets where mid=${mid} and sid=${d.set}`);
  if(sid[0]['COUNT(*)'] == 0){
    await db.query(`insert into sets (mid, sid, blue_team, red_team, blue_win, duration, red_kill, blue_kill) values(${mid},${d.set},${d.blue_team},${d.red_team},${d.blue_win},${(d.time_m*60)+d.time_s},${d.red_kill},${d.blue_kill})`);
  }else return false;
  sid = d.sets;

  // sid 받기

  // play 생성
  let promises = [];
  for(let ti=0; ti<2; ti++){
    let t = ti == 0 ? 'blue' : 'red';
    for(let pi=0; pi<5; pi++){
      // mid, sid, pid, side, ban, champion, kill, death, assist
      let pid = d[`${t}_${pi}_pid`];
      
      let bi = d[`${t}_${pi}_ban`];
      let ban = '';
      if(bi > -1  && bi < champions.length)
        ban = champions[bi];

      let ci = d[`${t}_${pi}_pick`];
      let champion = '';
      if(ci > -1  && ci < champions.length)
        champion = `${champions[ci]}`;
      
      let k = d[`${t}_${pi}_k`];
      let death = d[`${t}_${pi}_d`];
      let a = d[`${t}_${pi}_a`];
      promises.push(db.query(`insert into play values(${mid},${d.set},${pid},${ti},"${ban}","${champion}",${k},${death},${a})`));
    }
  }
  // 한번에 모든 play 들을 생성한다.
  await Promise.all(promises);
  return true;
}

module.exports = {getSets, getTeams, getPlayersFromTeam, insertSet, deleteSet};