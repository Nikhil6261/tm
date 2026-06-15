import mysql from '../db/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios'
import { sendOTP } from '../service/Email.js'

// Register Controller
export const register = async (req, res) => {
  let { name, password, role, email } = req.body;

  if (!name || !password || !role || !email) {
    return res.status(400).send('Please fill all input fields');
  }

  try {

    const [existing] = await mysql.execute("SELECT * FROM newuser WHERE email = ?", [email]);

    if (existing.length > 0) {
      return res.status(409).send('User already exists');
    }

    const hashpassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO newuser (user_name, password, role, email) VALUES (?, ?,  ?, ?)";
    const values = [name, hashpassword, role, email];
    await mysql.execute(sql, values);

    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).send('Internal server error');
  }
};


export const otp = async (req, res) => {
  const { email } = req.body

  try {
    const otp = Math.floor(1000 + Math.random() * 9000)

    const resposne = await sendOTP(otp, email)

    console.log(resposne);

    res.status(201).send(otp)
  } catch (error) {

    res.status(401).json({ message: 'otp have some issue' })
  }
}


// Login Controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    // Fetch user
    const [userdata] = await mysql.execute("SELECT * FROM newuser WHERE email = ?", [email]);

    if (userdata.length === 0) {
      return res.status(404).send('User not found');
    }

    const user = userdata[0];

    // Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Incorrect password');
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.SECRET, { expiresIn: '1d' });

    // Send response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.user_name, // fixed to match your column name
        email: user.email,
        role: user.role,
        number: user.number,
        orgid: user.organizationId,
        taskTable: user.task_table 
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).send('Internal server error');
  }
};



export const forgotpassword = async (req, res) => {
  const { email } = req.body

  try {
    const response = await axios.post('https://taskmanangement.onrender.com/user/otp', { email })
    
    res.status(200).send(response);
  } catch (error) { 
    res.status(401).send('this error is coming from forgot',error);
  }
}


export const reset_passwoad = async (req, res) => {
  const { email, password } = req.body

  try {
    const hashpassword = await bcrypt.hash(password, 10);

    const find = ' UPDATE newuser SET password = ? WHERE email = ?'
    const [resposne] = await mysql.execute(find, [hashpassword, email])

    res.status(200).send('reset password successfully ')
  } catch (error) {

    res.status(401).send('reset password failed', error)
  }
}
