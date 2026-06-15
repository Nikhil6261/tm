import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import router from './router/UserRouter.js';
import adminRoute from './router/admin.js';

import EmployeRoute from './router/EmployeRoute.js'

import OrganizationRoutes from './router/organizationRoutes.js';
import cookies from 'cookie-parser'

// import './node-cron/cron.js'

//checking propouse
import mysql from './db/db.js'
import jwt from 'jsonwebtoken'
//
const App = express();

App.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174','https://taskmanagmenttt.netlify.app' ,'https://task-manangement-git-main-jobleaayes-projects.vercel.app'],
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true,
}));

App.use(express.urlencoded({ extended: true }));
App.use(express.json());
App.use(cookies());

App.get('/', (req, res) => {
  res.send('Hello! Your server is working fine.');
});

App.use('/user', router);

App.use('/admin', adminRoute);

// App.use('/task', Task);

App.use('/employe', EmployeRoute);

// App.use('/manager',Manager );
App.use('/organization', OrganizationRoutes);



//for invites user set cookie
App.get('/invites/:token', async (req, res) => {

  const ogurl = req.originalUrl

  const url = ogurl.split('/')[2]

  console.log(url);

res.cookie('inviteToken' , url)
});


App.post('/check' ,(req,res)=>{

   const cookie = req.headers
  
   console.log(cookie);
   
})

export default App; 
