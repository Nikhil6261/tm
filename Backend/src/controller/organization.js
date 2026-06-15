import mysql from '../db/db.js'
import dotenv from 'dotenv';

import SchemaTask from '../db/SchmaForTask.js'
import userTable from '../db/userTable.js'

import createOrganizationTable from '../db/createOrganization.js'

dotenv.config(); // Load .env variables
const JWT_SECRET = process.env.JWT_SECRET;

//  Create a new organization

export const createOrganization = async (req, res) => {
  const { id } = req.params;
  const { name, email, mobile, organization_type, description } = req.body;

  // Generate unique table references
  const randomnumber = Math.floor(Math.random() * 6000);
  const REF = `REF${randomnumber}`;      // Organization table
  const TASKREF = `TASK${randomnumber}`; // Task table
  const USERSREF = `USERS${randomnumber}`; // User table
  const INVITEREF = `INVITE${randomnumber}`; // INVITE REF 

  // Step 1: Create organization table
  try {
    await createOrganizationTable(REF);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create organization table", error: err.message });
  }

  // Step 2: Create task table
  try {
    await SchemaTask(TASKREF);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create task table", error: err.message });
  }

  // Step 3: Create user table
  try {
    await userTable(USERSREF);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create user table", error: err.message });
  }

  // Step 4: Update the `newuser` table with references
  try {
    const updateSql = 'UPDATE newuser SET organizationID = ?, task_table = ? WHERE id = ?';
    await mysql.execute(updateSql, [REF, TASKREF, id]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user with org info", error: error.message });
  }

  // Step 5: Insert organization metadata into dynamic org table
  try {
    const insertSql = `INSERT INTO \`${REF}\` (name, email, mobile, organization_type, description, user_table , INVITEREF) VALUES (?, ? , ?, ?, ?, ?, ?)`;
    const values = [name, email, mobile, organization_type, description, USERSREF ,INVITEREF];
    await mysql.execute(insertSql, values);

    return res.status(201).json({
      message: 'Organization, task, and user tables created. User info updated successfully.',
      organization_table: REF,
      task_table: TASKREF,
      user_table: USERSREF
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to insert organization info", error: error.message });
  }
};



export const getOrganizations = async (req, res) => {
  const { orgid } = req.params;

  try {
    const tableName = `\`${orgid}\``;

    const [rows] = await mysql.execute(`SELECT * FROM ${tableName}`);

    res.status(200).json({ data: rows });
  } catch (error) {
    console.error('Show Bissness Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};



export const updateOrganization = async (req, res) => {
  const { orgid } = req.params;
  const { id, name, email, mobile, organization_type, description } = req.body;

  try {
    const tableName = `\`${orgid}\``;

    const updateSql = `
      UPDATE ${tableName} SET name = ?, email = ?, mobile = ?, organization_type = ?, description = ? WHERE id = ?
    `;

    const values = [name, email, mobile, organization_type, description, id];

    const [result] = await mysql.execute(updateSql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Organization record not found' });
    }

    res.status(200).json({ message: 'Organization updated successfully' });
  } catch (error) {
    console.error('Update organization error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};



export const deleteOrganization = async (req, res) => {
  const { orgid, taskref, usersref } = req.body;

  if (!orgid) {
    return res.status(400).json({ message: 'Organization table name (orgid) is required in request body' });
  }

  try {
    const queries = [];

    // Drop organization table
    queries.push(`DROP TABLE IF EXISTS \`${orgid}\``);

    // Drop task table if provided
    if (taskref) {
      queries.push(`DROP TABLE IF EXISTS \`${taskref}\``);
    }

    // Drop user table if provided
    if (usersref) {
      queries.push(`DROP TABLE IF EXISTS \`${usersref}\``);
    }

    for (const query of queries) {
      await mysql.execute(query);
    }

    res.status(200).json({ message: 'Organization and related tables deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error.message);
    res.status(500).json({ message: 'Error deleting tables', error: error.message });
  }
};
