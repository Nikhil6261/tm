import mysql from './db.js'

async function SchemaTask(REF) {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS \`${REF}\` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50),
    deadline_date DATE,
    assign_date DATE,
    role VARCHAR(50),
    user_id INT,
    priority VARCHAR(50),  
    completed_at DATETIME,
    createby INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );`;
  
  await mysql.execute(createTableQuery);
}

export default SchemaTask;
