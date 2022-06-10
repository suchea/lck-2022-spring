const mysql = require('mysql');

// mysql 서버와의 통신을 위한 클래스
class Sql {
  constructor() {
    // 연결 정보
    this.connection = mysql.createPool({
      host: 'localhost',
      port: 3306,
      user: 'user',
      password: 'pass',
      database: 'lck_2022_spring'
    })

    this.connection.getConnection(err => {
      if (err) console.log("db fail", err);
      else console.log("db success");
    })
  }

  // 쿼리 처리 함수
  query(query) {
    // 실행된 쿼리를 콘솔에 출력한다
    console.log(query);
    // promise 형태로 반환한다
    return new Promise((resolve, reject) => {
      this.connection.getConnection((err, connect) => {
        if (err) {
          console.log(err);
          console.error(err);
          connect.release();
          return reject(err);
        }
        connect.query(query, (error, rows) => {
          if (error) reject(error);
          else resolve(rows);
        });
        connect.release();
      })
    });
  }
}

module.exports = new Sql();