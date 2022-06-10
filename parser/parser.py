from bs4 import BeautifulSoup
import requests
import pymysql
import traceback
from lxml import etree

# 파싱하게 되는 페이지 주소
baseurl = 'https://lol.inven.co.kr/dataninfo/match/teamList.php?&iskin=lol&category2=166&pg='

# mysql 서버와의 통신을 위한 정보
db = pymysql.connect(
    user='user', 
    passwd='pass', 
    host='127.0.0.1', 
    db='lck_2022_spring', 
    charset='utf8'
)

# 요청에 사용되는 헤더
header={"accept": "*/*","accept-language": "ko-KR,ko;q=0.9","content-type": "application/x-www-form-urlencoded;charset=UTF-8","sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Google Chrome\";v=\"101\"","sec-ch-ua-mobile": "?0","sec-ch-ua-platform": "\"Windows\"","sec-fetch-dest": "empty","sec-fetch-mode": "cors","sec-fetch-site": "same-origin","Referer": "https://lol.inven.co.kr/dataninfo/proteam/proteam.php?code=223&iskin=lol","Referrer-Policy": "strict-origin-when-cross-origin"}
cookie={'as_state_v2':'브라우저에서 가져와야 하는 값'}

# get 요청을 보내주는 함수 : response의 text를 반환한다
def get(url):
    response = requests.get(url, headers=header, cookies=cookie)
    for k in response.headers:
        if 'cookie' in k.lower():
            v = response.headers[k].split(';')[0].split('=')
            cookie[v[0]] = v[1]
    print(cookie)
    return response.text

# match 세부정보를 불러온다 : match 식별자인 matchcode를 입력값으로 받는다 : response의 text를 반환한다
def post(url, code):
    data = {'matchcode':code}
    response = requests.post(url,headers=header, cookies=cookie, data=data)
    return response.text

# 경기 데이터가 담긴 웹 페이지에서 모든 데이터를 파싱한다
# 파싱된 데이터는 db에 저장된다
def parsePage(url):
    d = BeautifulSoup(get(url), "lxml")
    for e in d.select('div.listFrame'):
        try:
            print(e.select_one('div.stage').text)
            code = int(e.get('id').replace('match',''))
            date = e.select_one('div.date').text.replace('.','-')
            
            info = e.select_one('div.stage').text.split('일차 ')
            day = int(info[0])
            match_name = info[1]
            setno = 0
            if '세트' in match_name:
                i = match_name.rindex(' ')
                setno = int(match_name[i+1:].replace('세트',''))
                match_name = match_name[:i]

            # 0: blue, 1: purple
            teams = e.select('div[class*="Team"]')
            blue_win = teams[0].select_one('div.rightPart div').text == 'W'

            blue_team = teams[0].select_one('a').text
            blue_tid = getTid(blue_team)
            blue_ban = []
            for i in teams[0].select('ul.ban li img'):
                blue_ban.append(i['onmouseover'].split('\'')[1].split('\'')[0])

            red_team = teams[1].select_one('a').text
            red_tid = getTid(red_team)
            red_ban = []
            for i in teams[1].select('ul.ban li img'):
                red_ban.append(i['onmouseover'].split('\'')[1].split('\'')[0])
            
            #set
            ks = e.select_one('div.killscore span.tx4').text.split(' : ')
            blue_kill = int(ks[0])
            red_kill = int(ks[1])

            ts = e.select_one('div.gametime').contents[2].strip().split(' ')
            if len(ts)>1:
                duration = (int(ts[0][:-1]) * 60)  + int(ts[1][:-1])
            else:
                duration = int(ts[0][:-1])


            mid = addMatch(match_name, day, date)
            addSet(mid, setno, blue_tid, red_tid, blue_win, duration, red_kill, blue_kill)


            #match details
            xml = post('https://lol.inven.co.kr/dataninfo/match/match_detail.xml.php',code).replace('<?xml version="1.0" encoding="UTF-8"?>','')
            root = etree.fromstring(xml)
            index = 0
            for p in root.findall('player'):
                ban = ''
                side = 0
                tid = 0
                
                if int(p.find('side').text) == 1:
                    tid = blue_tid
                    if len(blue_ban) == 0 :
                        ban = ''
                    else:
                        ban = blue_ban.pop(0)
                else:
                    tid = red_tid
                    if len(red_ban) == 0 :
                        ban = ''
                    else:
                        ban = red_ban.pop(0)
                    side = 1
                
                pid = getPid(p.find('playername').text)
                #플레이어 없음 : 직접 긁어옴
                if pid == -1:
                    pid = fetchPlayer(p.find('playercode').text, tid, index%5)
                
                kill = int(p.find('kill').text)
                death = int(p.find('death').text)
                assist = int(p.find('assist').text)
                champion = p.find('champname').text
                addPlay(mid, setno, pid, side, ban, champion, kill, death, assist)
                index += 1
        except Exception:
            traceback.print_exc()
            continue
    return len(d.select_one('span.nexttext')['class']) == 2

# 팀 이름으로 팀 식별자 tid를 불러온다
def getTid(name):
    with db.cursor() as c:
        # check team exists
        c.execute('select tid from team where team_name=%s', name)
        row = c.fetchone()
        if row != None:
            return row[0]

# 이름으로 플레이어 식별자 pid를 불러온다
def getPid(name):
    with db.cursor() as c:
        # check player exists
        c.execute('select pid from player where username=%s', name)
        row = c.fetchone()
        if row != None:
            return row[0]
        return -1

# 플레이어 정보를 불러와서 db에 저장한다
def fetchPlayer(code, tid, position):
    d = BeautifulSoup(get('https://lol.inven.co.kr/dataninfo/proteam/progamer.php?code='+code),'lxml')
    username = d.select_one('h2.block.name').text
    info = d.select_one('div.block.bottom.clearfix')
    realname = info.select_one('p').text.strip()
    print(username, realname)
    try:
        ptext = info.select('b')[1].text.lower()
        if ptext == 'top':
            position=0
        elif ptext == 'jungler':
            position=1
        elif ptext == 'mid':
            position=2
        elif ptext == 'bot ad':
            position=3
        elif ptext == 'supporter':
            position=4
    except Exception as e:
        print(e)
    return addPlayer(username, realname, position, tid)

# db의 plays 테이블에 플레이어 기록을 추가한다
def addPlay(mid, sid, pid, side, ban, champion, kill, death, assist):
    with db.cursor() as c:
        # check exists
        c.execute('select mid,sid,pid from play where mid=%s and sid=%s and pid=%s', (mid,sid,pid))
        row = c.fetchone()
        if row != None:
            return row
        # insert if new
        c.execute('insert into play values(%s,%s,%s,%s,%s,%s,%s,%s,%s)', (mid, sid, pid, side, ban, champion, kill, death, assist))
        db.commit()
        return c.lastrowid

# db의 sets 테이블에 세트 정보를 추가한다
def addSet(mid, sid, blue_team, red_team, blue_win, duration, red_kill, blue_kill):
    with db.cursor() as c:
        # check exists
        c.execute('select mid,sid from sets where mid=%s and sid=%s', (mid,sid))
        row = c.fetchone()
        if row != None:
            return row
        # insert if new
        c.execute('insert into sets (mid, sid, blue_team, red_team, blue_win, duration, red_kill, blue_kill) values(%s,%s,%s,%s,%s,%s,%s,%s)', (mid, sid, blue_team, red_team, blue_win, duration, red_kill, blue_kill))
        db.commit()
        return c.lastrowid


# db의 matches 테이블에 경기 정보를 추가한다
def addMatch(match_name, day, date):
    with db.cursor() as c:
        # check exists
        c.execute('select mid from matches where match_name=%s and day=%s', (match_name, day))
        row = c.fetchone()
        if row != None:
            return row[0]
        # insert if new
        c.execute('insert into matches (match_name, day, date) values(%s,%s,%s)', (match_name, day, date))
        db.commit()
        return c.lastrowid

# db의 team 테이블에 팀 정보를 추가한다
def addTeam(name, rank, match_count, win, lose, kda):
    with db.cursor() as c:
        # check team exists
        c.execute('select tid from team where team_name=%s', name)
        row = c.fetchone()
        if row != None:
            return row[0]
        # insert if new
        c.execute('insert into team (team_name, team_rank, match_count, win, lose, kda) values(%s,%s,%s,%s,%s,%s)', (name.strip(), rank, match_count, win, lose, kda))
        db.commit()
        return c.lastrowid

# db의 player 테이블에 플레이어 정보를 추가한다
def addPlayer(username, realname, position, tid):
    with db.cursor() as c:
        # check player exists
        c.execute('select pid from player where username=%s', username)
        row = c.fetchone()
        if row != None:
            return row[0]
        # insert if new
        c.execute('insert into player (username, realname, position, tid) values(%s,%s,%s,%s)', (username, realname, position, tid))
        db.commit()
        return c.lastrowid


# 팀 정보 + 해당 팀의 플레이어 정보들을 불러온다
def initialize():
    try: 
        md = BeautifulSoup(get('https://lol.inven.co.kr/dataninfo/proteam/proteam_gate.php'), "lxml")
        for t in md.select('div.teamlogo a'):
            # 팀 페이지
            html = get('https://lol.inven.co.kr/dataninfo/proteam/'+t['href'])
            d = BeautifulSoup(html, "lxml")
            # team info
            name = d.select_one('h2.block.name').text
            rank = int(d.select_one('div.block.rank p.value.blue').text.replace('위',''),10)
            tid = -1
            for e in d.select('table.table.log_list.log01 tr'):
                info = e.select('td')
                if info == None or len(info) == 0 or info[0].get_text() != '2022 LoL 챔피언스 코리아 스프링 정규 시즌':
                    continue
                match_count = int(info[1].text)
                win = int(info[2].text)
                lose = int(info[3].text)
                kda = float(info[8].text)
                tid = addTeam(name, rank, match_count, win, lose, kda)
                break
            
            #players
            for row in d.select('div.listTable')[1].select('tbody tr'):
                info = row.select('td')

                #탑 정글 미드 봇 서폿 순으로 0~4
                position = int(info[0].select_one('img')['src'][-5:-4])
                if position == 2:
                    position = 3
                elif position == 3:
                    position = 2
                position-=1
                
                realname = info[1].select_one('a').text
                username = info[2].select_one('a').text

                addPlayer(username, realname, position, tid)
    except:
        return

# 팀 정보와 플레이어 정보를 불러온다
initialize()
# page 1부터 시작하여 마지막 페이지까지 경기 데이터를 불러온다
page = 1
while(parsePage(baseurl+str(page))):
    page += 1