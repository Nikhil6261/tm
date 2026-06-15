import { log } from 'console';
import mysql from '../db/db.js';
import { sendmail } from '../service/Email.js'
import { generateInvite } from '../service/url.js'
import { promises } from 'dns';


export const createtask = async (req, res) => {
  const { title, description, deadline_date, assign_date,  userids, priority, create_by, reftask } = req.body;

  console.log( title, description, deadline_date, assign_date,  userids, priority, create_by, reftask);
  

  if (!title || !description || !deadline_date || !assign_date  || !userids || userids.length === 0 || !reftask) {
    return res.status(400).send("All fields including reftask are required");
  }

  try {
    // Step 1: Insert into dynamic task table
    const insertTaskQuery = `
      INSERT INTO \`${reftask}\` (title, description,  deadline_date, assign_date,  user_id, priority, completed_at, createby, created_at, updated_at)
      VALUES (?, ?, ?,  ?,  NULL, ?, NULL, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    const values = [title, description || "pending", deadline_date, assign_date,  priority, create_by];
    const [task] = await mysql.execute(insertTaskQuery, values);

    const taskid = task.insertId;

    // Step 2: If group task
    if (userids.length > 1) {
      const insertGroupTasks = userids.map((id) => {
        const sql = 'INSERT INTO group_tasks (user_id, taskid) VALUES (?, ?)';
        return mysql.execute(sql, [id, taskid]);
      });
      await Promise.all(insertGroupTasks);

      return res.status(200).json({ message: "Group Task Created", taskId: taskid });
    }

    // Step 3: Single user task
    const singleUserId = userids[0];
    const updateQuery = `UPDATE \`${reftask}\` SET user_id = ? WHERE id = ?`;
    await mysql.execute(updateQuery, [singleUserId, taskid]);

    // Step 4: Send mail
    const [userDetail] = await mysql.execute("SELECT * FROM newuser WHERE id = ?", [singleUserId]);
    if (!userDetail.length) {
      return res.status(404).send("User not found");
    }
    sendmail(userDetail[0], title, description, deadline_date);

    // Step 5: Generate invite URL (requires url column!)
    const url = await generateInvite(userDetail[0].email, taskid);

    // Ensure the dynamic table has `url` column or this will fail
    await mysql.execute(`ALTER TABLE \`${reftask}\` ADD COLUMN IF NOT EXISTS url VARCHAR(255)`);
    await mysql.execute(`UPDATE \`${reftask}\` SET url = ? WHERE id = ?`, [url, taskid]);

    return res.status(200).json({ message: "Task Created", taskId: taskid });
  } catch (error) {
    console.error("Task insert error:", error.message);
    return res.status(500).send("Internal Server Error");
  }
};




export const readTask = async (req, res) => {
  try {
    const { REFTASK, create_by } = req.body;

    console.log(REFTASK, create_by);

    if (!REFTASK || !create_by) {
      return res.status(400).send("REFTASK and createby are required");
    }

    const sql = ` SELECT t.*, n.user_name   FROM \`${REFTASK}\` AS t LEFT JOIN newuser n ON t.user_id = n.id WHERE t.createby = ? `;

    const [data] = await mysql.execute(sql, [create_by]);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).send("Server error: " + error.message);
  }
};



export const updateTask = async (req, res) => {
  const { REFTASK, title, description, deadline_date, assign_date } = req.body;
  const id = req.params.id; // fix: get id from params


  try {
    const sql = `UPDATE \`${REFTASK}\` 
                 SET title = ?, description = ?, deadline_date = ?, assign_date = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`;
    const [result] = await mysql.execute(sql, [title, description, deadline_date, assign_date, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    // get user id from updated task
    const [taskRow] = await mysql.execute(`SELECT user_id FROM \`${REFTASK}\` WHERE id = ?`, [id]);
    if (!taskRow.length || !taskRow[0].user_id) {
      return res.status(200).json({ message: "Task updated, but no user assigned" });
    }

    const userid = taskRow[0].user_id; // fix: set userid

    // email updating 
    const emailQUERY = "SELECT * FROM newuser WHERE id = ?";
    const [userDetail] = await mysql.execute(emailQUERY, [userid]);

    if (userDetail.length) {
      await sendmail(userDetail[0], title, description, deadline_date);
    }

    res.status(200).json({ message: "successfully updated", taskId: id });
  } catch (error) {
    console.error("Error updating task:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const deleteTask = async (req, res) => {
  const { REFTASK } = req.body;
  const { id } = req.params;

  console.log(REFTASK);

  try {
    if (!REFTASK) {
      return res.status(400).json({ message: "REFTASK (table name) is required" });
    }

    // Step 1: Delete group task entries (if any)
    await mysql.execute(`DELETE FROM group_tasks WHERE taskid = ?`, [id]);

    // Step 2: Delete from dynamic task table
    const sql = `DELETE FROM \`${REFTASK}\` WHERE id = ?`;
    const [result] = await mysql.execute(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Successfully deleted", taskId: id });
  } catch (error) {
    console.error("Error deleting task:", error.message);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};


// Show all employees excluding 'admin' and 'manager'

export const AllEmployes = async (req, res) => {

  const USERREF = req.params

  console.log(USERREF.ref);

  try {

    // WHERE LOWER(role) <> 'admin'

    const sql = `SELECT * FROM ${USERREF.ref} `;
    const [data] = await mysql.execute(sql)
    console.log(data);

    res.send(data).status(201)
  } catch (error) {
    console.log(error);
    res.status(401).send('error found in backend', error)
  }
}



export const priority = async (req, res) => {

  const { id } = req.params
  const { priority } = req.body

  const taskid = id
  console.log(taskid, priority);

  try {

    const sql = 'UPDATE tasks SET priority = ? WHERE id = ?'
    const [result] = await mysql.execute(sql, [priority, taskid])

    console.log(result);

    res.status(201).send('successfull added', result)
  } catch (error) {
    console.log(error);
    res.status(400).send("not geting priority", error)
  }

}


export const Complete_Task_form_user = async (req, res) => {

  try {

    const sql = ` SELECT deletetask.*,  newuser.user_name,  newuser.email  FROM deletetask INNER JOIN newuser ON deletetask.user_id = newuser.id `;
    const [data] = await mysql.execute(sql)

    console.log(data);
    res.status(201).send(data)
  } catch (error) {
    res.status(500).send('complete task data not to fetch', error)
  }

}

export const admindetail = async (req, res) => {
  const { id } = req.params

  console.log(id);

  try {
    const sql = 'SELECT * FROM newuser WHERE id = ? '
    const [data] = await mysql.execute(sql, [id]);

    res.status(200).send(data)
  } catch (error) {
    res.status(401).send('all detail failed')
  }
}


//update detail 
//add number ,name
export const adminupdatedetail = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!id || (!name)) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const sql = `UPDATE newuser SET user_name = ? WHERE id = ?`;
    const [result] = await mysql.execute(sql, [name, id]);

    if (result.affectedRows === 0) {
      return res.status(404).send("User not found or no changes made");
    }

    res.status(200).send("User details updated successfully");
  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};


// Read group tasks along with all tasks
export const group_read_task = async (req, res) => {
  try {
    // Step 1: Get all tasks
    const taskSql = "SELECT * FROM tasks";
    const [tasks] = await mysql.execute(taskSql);

    // Step 2: Get all group tasks
    const groupSql = "SELECT * FROM group_tasks";
    const [groupTasks] = await mysql.execute(groupSql);

    // Step 3: Build a task-user map with proper async handling
    const taskUserMap = {};

    await Promise.all(groupTasks.map(async (entry) => {
      const taskId = entry.taskid;

      if (!taskUserMap[taskId]) {
        taskUserMap[taskId] = [];
      }

      const userSql = 'SELECT * FROM newuser WHERE id = ?';
      const [userData] = await mysql.execute(userSql, [entry.user_id]);

      // Store userData[0] (single user object) instead of array
      if (userData.length > 0) {
        taskUserMap[taskId].push(userData[0]);
      }
    }));

    // Step 4: Attach users to each task
    const connectedTasks = tasks.map(task => {
      return {
        ...task,
        assigned_users: taskUserMap[task.id] || []
      };
    });

    // Step 5: Filter tasks assigned to multiple users
    const multipleAssignedTasks = connectedTasks.filter(task => task.assigned_users.length > 1);

    // Optional: Return only what’s necessary
    res.status(200).json({
      multipleAssignedTasks,
      allTasks: connectedTasks,
    });

  } catch (error) {
    res.status(500).json({ message: "Read failed", error: error.message });
  }
};


//update group



//delete group task 
export const deleteGroupTask = async (req, res) => {
  const taskid = req.params;

  console.log(taskid.id);

  if (!taskid.id) {
    return res.status(400).send('Task ID is required');
  }


  try {

    const sql1 = 'DELETE FROM group_tasks WHERE taskid = ?';
    await mysql.execute(sql1, [taskid.id]);

    const sql2 = 'DELETE FROM tasks WHERE id = ?';
    await mysql.execute(sql2, [taskid.id]);

    res.status(200).send('Task and group task deleted successfully');
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).send('Internal server error');
  }
};
