import mysql from '../db/db.js'

export const joinCode = async (req, res) => {
    const { code } = req.params
    const { id } = req.body

    try {
        const sql1 = 'SELECT * FROM newuser WHERE id = ?';
        const [rows] = await mysql.execute(sql1, [id]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'User not exists' });
        }

        const { id: userId, user_name: username, email } = rows[0];

        const searchTable = `SELECT * FROM ${code}`;
        const [data] = await mysql.execute(searchTable, [code]);


        const sql = `INSERT INTO ${data[0].user_table} (id, name, email) VALUES (?, ?, ?)`
        const [respone] = await mysql.execute(sql, [userId, username, email])

        const updateTable = `UPDATE newuser SET Member_org = ? WHERE id = ?`;
        const [updateData] = await mysql.execute(updateTable, [rows[0].task_table, userId]);
        console.log('hi');

        if (updateData.affectedRows === 0) {
            return res.status(404).json({ message: "User not found or not updated" });
        }

        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}



export const speficEmploye = async (req, res) => {
    const { id } = req.params

    console.log(id);

    try {
        const sql = ' SELECT * FROM tasks WHERE user_id = ?'
        const [data] = await mysql.execute(sql, [id])

        res.status(200).send(data)
    } catch (error) {
        res.status(401).send("task not found ", error)
    }

}


export async function deleteTask(id) {

    try {

        const findata = 'SELECT * FROM tasks WHERE id  = ?'
        const [get] = await mysql.execute(findata, [id])

        const data = get[0]
        console.log(data);

        const deletesql = ' INSERT INTO deletetask (title ,description	,status ,deadline_date,  assign_date, role , user_id , priority )  VALUES(?,?,?,?,  ?,?,?,? ) '
        const deletevalue = [data.title, data.description, data.status, data.deadline_date, data.assign_date, data.role, data.user_id, data.priority]

        const { loc } = await mysql.execute(deletesql, deletevalue)

        const deleteQuery = 'DELETE FROM tasks WHERE id = ?';
        await mysql.execute(deleteQuery, [id]);

    } catch (error) {
        console.log(error);
        return error;
    }
}
