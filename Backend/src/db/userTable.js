import mysql from './db.js'

async function userTable(REF) {
    
    const usertable = ` CREATE TABLE IF NOT EXISTS \`${REF}\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(150) UNIQUE,
        mobile VARCHAR(20),
        role VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`

    await mysql.execute(usertable);
}

export default userTable;