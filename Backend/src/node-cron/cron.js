// import cron from 'node-cron';
// import mysql from './db/db.js';

// export const task = cron.schedule('* * * * *', async () => {
//   console.log("🕒 Checking for completed tasks older than 2 mins...");

//   const fetchSql = `
//     SELECT * FROM tasks 
//     WHERE status = 'completed' 
//     AND completed_at < DATE_SUB(NOW(), INTERVAL 2 MINUTE)
//   `;

//   const [rows] = await mysql.execute(fetchSql);

//   for (const task of rows) {
//     // 1. Move to deletetask
//     const insertSql = `
//       INSERT INTO deletetask 
//       (title, description, status, deadline_date, assign_date, role, user_id, priority) 
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//     `;
//     const insertValues = [
//       task.title,
//       task.description,
//       task.status,
//       task.deadline_date,
//       task.assign_date,
//       task.role,
//       task.user_id,
//       task.priority,
//     ];
//     await mysql.execute(insertSql, insertValues);

//     // 2. Delete from tasks
//     await mysql.execute('DELETE FROM tasks WHERE id = ?', [task.id]);

//     console.log(`✅ Moved and deleted task id: ${task.id}`);
  
//   }
// });

