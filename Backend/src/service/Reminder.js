import cron from 'node-cron';
import mysql from '../db/db.js'; // your DB connection
import { sendReminderEmail } from './Email.js'; // your email function

export const reminder = cron.schedule('* * * * *', async () => {

    const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  const formattedNow = localNow.toISOString().slice(0, 19).replace('T', ' ');

  try {

    const sql = ' SELECT * FROM tasks  WHERE reminder_time <= ?  AND reminder_sent = 0'
    
    const [tasks] = await mysql.execute(sql [formattedNow]);

    for (const task of tasks) {

      await sendReminderEmail(task);

      await mysql.execute(`UPDATE tasks SET reminder_sent = 1 WHERE id = ?`, [task.id]);
      console.log(`✅ Reminder sent for: ${task.title}`);
    }
  } catch (error) {
    console.error('❌ Cron job error:', error);
  }
});
