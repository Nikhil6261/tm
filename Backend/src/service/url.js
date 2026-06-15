import mysql from '../db/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Helper: Generate token
const generateInviteToken = (taskid, email) => {
  const secret = process.env.INVITE_SECRET;

  if (!secret) {
    throw new Error("Missing INVITE_SECRET in .env file");
  }

  return jwt.sign({ taskid, email }, secret , { expiresIn: '1d' });
};

// Main function to generate invite link
export async function generateInvite(email, taskId) {
  try {
    if (!email || !taskId) {
      throw new Error("Missing email or task ID");
    }

    console.log("Generating invite for:", email, taskId);

    const token = generateInviteToken(taskId, email);
    const inviteLink = `https://kkkkkgaggs.netlify.app/invite/${token}`;

    const sql = "INSERT INTO  invites (task_id ,token ) VALUES(?,?)";
    console.log(taskId);
    
    const [existingInvite] = await mysql.execute(sql, [taskId , token]);


    console.log("Generated Invite Link:", inviteLink);
    return inviteLink;
  } catch (err) {
    console.error("Error generating invite:", err.message);
    throw err;
  }
}