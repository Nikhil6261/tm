import mysql from '../db/db.js'
import { sendmail } from '../service/Email.js'
import { generateInvite } from '../service/url.js'


async function group(userids, taskid) {

    try {
        const insertGroupTasks = userids.map((id) => {
            const sql = 'INSERT INTO group_tasks (user_id, taskid) VALUES (?, ?)';
            return mysql.execute(sql, [id, taskid]);
        });

        await Promise.all(insertGroupTasks);

        return { message: "Group Task Created", taskId: taskid }
    } catch (error) {
        console.error("Error inserting group tasks:", error);
        return { error: "Failed to insert group tasks" }
    }
}

export const CreateByManager = async (req, res) => {
    const { title, description, deadline_date, assine_date, created_by, userids } = req.body;

    if (!title || !description || !deadline_date || !assine_date || !created_by || !userids) {
        return res.status(400).send("All fields are required");
    }

    try {
        // Insert task
        const query = ` INSERT INTO task_of_manager  (title, description, deadline_date, assign_date, created_by )  VALUES (?, ?, ?, ?,  ?)`;
        const values = [title, description, deadline_date, assine_date, created_by];
        const [task] = await mysql.execute(query, values);

        const taskid = task.insertId;

        if (userids.length > 1) {

            group( userids, taskid )
        }

        // If only one user: treat as individual task
        const singleUserId = userids[0];

        const updateQuery = `UPDATE task_of_manager SET user_id = ? WHERE id = ?`;
        await mysql.execute(updateQuery, [singleUserId, taskid]);



        // Fetch user info and send email
        const [userDetail] = await mysql.execute("SELECT * FROM newuser WHERE id = ?", [singleUserId]);
        if (!userDetail.length) {
            return res.status(404).send("User not found");
        }

        sendmail(userDetail[0], title, description, deadline_date);

        console.log("hi3");
        // Generate invite URL
        const url = await generateInvite(userDetail[0].email, taskid);

        // Save URL to task
        await mysql.execute(`UPDATE tasks SET url = ? WHERE id = ?`, [url, taskid]);

        return res.status(200).json({ message: "Task Created", taskId: taskid });
    } catch (error) {
        console.error("Task insert error:", error.message);
        return res.status(500).send("Internal Server Error");
    }
};

export const readTaskOfManager = async (req, res) => {

    try {

        const sql = `SELECT task_of_manager.*, newuser.user_name   FROM task_of_manager LEFT JOIN newuser ON task_of_manager.user_id = newuser.id`;
        const [data] = await mysql.execute(sql);

        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching tasks:", error.message);
        res.status(500).send("Server error: " + error.message);
    }
};



export const deleteManager = async (req, res) => {
    const { id } = req.params;

    try {
        const sql = 'DELETE FROM task_of_manager WHERE id = ?';
        const [result] = await mysql.execute(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Manager not found');
        }

        res.status(200).send('Deleted successfully');
    } catch (error) {
        res.status(500).send(error.message || 'Server Error');
    }
};



export const onlyEmployes = async (req,res)=>{

    try {

    const sql = ' SELECT * FROM newuser WHERE LOWER(role) = "employee"';
    const [data] = await mysql.execute(sql)
    console.log(data);

    res.send(data).status(201)
  } catch (error) {
    console.log(error);
    res.status(401).send('error found in backend', error)
  }
}
