const bcrypt = require('bcryptjs');

// 관리자 비밀번호
let password = 'password';

// passport에서의 비교를 위해 미리 해쉬를 해둔다.
let salt = bcrypt.genSaltSync(10);
let hash = bcrypt.hashSync(password, salt);

module.exports = hash;