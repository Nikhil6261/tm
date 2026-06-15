import mysql from './db.js'

async function createOrganizationTable(tableName) {
  const query = `
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      mobile VARCHAR(15),
      organization_type VARCHAR(100),
      description TEXT,
      user_table TEXT,
      INVITEREF TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await mysql.execute(query);
}


export default createOrganizationTable;