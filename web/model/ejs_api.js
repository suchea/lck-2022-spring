// ejs에서 렌더링 하는데 사용되는 함수 모음이다.
// 직접 입력하기에는 양이 너무 많거나 자주 반복되는 정적인 데이터셋을 제공한다.

// (tid)에 해당하는 팀 로고 주소를 반환한다.
function getTeamLogo(tid) {
    switch (tid) {
        case 1:
            return '/public/teams/skt.png'
        case 2:
            return '/public/teams/geng.svg'
        case 3:
            return '/public/teams/kia.svg'
        case 4:
            return '/public/teams/drx.svg'
        case 5:
            return '/public/teams/freecs.png'
        case 6:
            return '/public/teams/brion.png'
        case 7:
            return '/public/teams/kt.svg'
        case 8:
            return '/public/teams/ns.png'
        case 9:
            return '/public/teams/sb.png'
        case 10:
            return '/public/teams/hw.svg'
    }
    return null;
}

// league of legends의 api에서 챔피언 아이콘을 가져오는데 사용된다.
const championBaseUrl = "http://ddragon.leagueoflegends.com/cdn/12.10.1/img/champion/";
const championPic = {'아트록스': 'Aatrox.png', '아리': 'Ahri.png', '아칼리': 'Akali.png', '아크샨': 'Akshan.png', '알리스타': 'Alistar.png', '아무무': 'Amumu.png', '애니비아': 'Anivia.png', '애니': 'Annie.png', '아펠리오스': 'Aphelios.png', '애쉬': 'Ashe.png', '아우렐리온 솔': 'AurelionSol.png', '아지르': 'Azir.png', '바드': 'Bard.png', '블리츠크랭크': 'Blitzcrank.png', '브랜드': 'Brand.png', '브라움': 'Braum.png', '케이틀린': 'Caitlyn.png', '카밀': 'Camille.png', '카시오페아': 'Cassiopeia.png', '초가스': 'Chogath.png', '코르키': 'Corki.png', '다리우스': 'Darius.png', '다이애나': 'Diana.png', '드레이븐': 'Draven.png', '문도 박사': 'DrMundo.png', '에코': 'Ekko.png', '엘리스': 'Elise.png', '이블린': 'Evelynn.png', '이즈리얼': 'Ezreal.png', '피들스틱': 'Fiddlesticks.png', '피오라': 'Fiora.png', '피즈': 'Fizz.png', '갈리오': 'Galio.png', '갱플랭크': 'Gangplank.png', '가렌': 'Garen.png', '나르': 'Gnar.png', '그라가스': 'Gragas.png', '그레이브즈': 'Graves.png', '그웬': 'Gwen.png', '헤카림': 'Hecarim.png', '하이머딩거': 'Heimerdinger.png', '일라오이': 'Illaoi.png', '이렐리아': 'Irelia.png', '아이번': 'Ivern.png', '잔나': 'Janna.png', '자르반 4세': 'JarvanIV.png', '잭스': 'Jax.png', '제이스': 'Jayce.png', '진': 'Jhin.png', '징크스': 'Jinx.png', '카이사': 'Kaisa.png', '칼리스타': 'Kalista.png', '카르마': 'Karma.png', '카서스': 'Karthus.png', '카사딘': 'Kassadin.png', '카타리나': 'Katarina.png', '케일': 'Kayle.png', '케인': 'Kayn.png', '케넨': 'Kennen.png', '카직스': 'Khazix.png', '킨드레드': 'Kindred.png', '클레드': 'Kled.png', '코그모': 'KogMaw.png', '르블랑': 'Leblanc.png', '리 신': 'LeeSin.png', '레오나': 'Leona.png', '릴리아': 'Lillia.png', '리산드라': 'Lissandra.png', '루시안': 'Lucian.png', '룰루': 'Lulu.png', '럭스': 'Lux.png', '말파이트': 'Malphite.png', '말자하': 'Malzahar.png', '마오카이': 'Maokai.png', '마스터 이': 'MasterYi.png', '미스 포츈': 'MissFortune.png', '오공': 'MonkeyKing.png', '모데카이저': 'Mordekaiser.png', '모르가나': 'Morgana.png', '나미': 'Nami.png', '나서스': 'Nasus.png', '노틸러스': 'Nautilus.png', '니코': 'Neeko.png', '니달리': 'Nidalee.png', '녹턴': 'Nocturne.png', '누누와 윌럼프': 'Nunu.png', '올라프': 'Olaf.png', '오리아나': 'Orianna.png', '오른': 'Ornn.png', '판테온': 'Pantheon.png', '뽀삐': 'Poppy.png', '파이크': 'Pyke.png', '키아나': 'Qiyana.png', '퀸': 'Quinn.png', '라칸': 'Rakan.png', '람머스': 'Rammus.png', '렉사이': 'RekSai.png', '렐': 'Rell.png', '레나타 글라스크': 'Renata.png', '레넥톤': 'Renekton.png', '렝가': 'Rengar.png', '리븐': 'Riven.png', '럼블': 'Rumble.png', '라이즈': 'Ryze.png', '사미라': 'Samira.png', '세주아니': 'Sejuani.png', '세나': 'Senna.png', '세라핀': 'Seraphine.png', '세트': 'Sett.png', '샤코': 'Shaco.png', '쉔': 'Shen.png', '쉬바나': 'Shyvana.png', '신지드': 'Singed.png', '사이 온': 'Sion.png', '시비르': 'Sivir.png', '스카너': 'Skarner.png', '소나': 'Sona.png', '소라카': 'Soraka.png', '스웨인': 'Swain.png', '사일러스': 'Sylas.png', '신드라': 'Syndra.png', '탐 켄치': 'TahmKench.png', '탈리야': 'Taliyah.png', '탈론': 'Talon.png', '타릭': 'Taric.png', '티모': 'Teemo.png', '쓰레쉬': 'Thresh.png', '트리스타나': 'Tristana.png', '트런들': 'Trundle.png', '트린다미어': 'Tryndamere.png', '트위스티드 페이트': 'TwistedFate.png', '트위치': 'Twitch.png', '우디르': 'Udyr.png', '우르곳': 'Urgot.png', '바루스': 'Varus.png', '베인': 'Vayne.png', '베이가': 'Veigar.png', '벨코즈': 'Velkoz.png', '벡스': 'Vex.png', '바이': 'Vi.png', '비에고': 'Viego.png', '빅토르': 'Viktor.png', '블라디미르': 'Vladimir.png', '볼리베어': 'Volibear.png', '워윅': 'Warwick.png', '자야': 'Xayah.png', '제라스': 'Xerath.png', '신 짜오': 'XinZhao.png', '야스오': 'Yasuo.png', '요네': 'Yone.png', '요릭': 'Yorick.png', '유미': 'Yuumi.png', '자크': 'Zac.png', '제드': 'Zed.png', '제리': 'Zeri.png', '직스': 'Ziggs.png', '질리언': 'Zilean.png', '조이': 'Zoe.png', '자이라': 'Zyra.png'};

// (name)에 해당되는 챔피언 아이콘 주소를 가져온다.
function championIcon(name){
    let path = championPic[name];
    if(path === undefined)
        return 'https://ddragon.leagueoflegends.com/cdn/12.10.1/img/profileicon/29.png';
    return championBaseUrl + path;
}

module.exports = { getTeamLogo, championIcon }