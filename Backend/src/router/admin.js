import express from 'express'
import { deleteTask, readTask, createtask, updateTask, AllEmployes, priority, Complete_Task_form_user, admindetail ,adminupdatedetail, group_read_task,deleteGroupTask} from '../controller/AdminTask.js'

const admin = express.Router()


// crud of task 
admin.post('/createtask', createtask)

admin.get('/alltask', readTask)

admin.put('/updatetask/:id', updateTask)

admin.delete('/taskdelete/:id', deleteTask)

/// complete ///

admin.get('/allemploye/:ref', AllEmployes)

admin.get('/detail/:id', admindetail)

///////////

admin.put('/updatedetail/:id', adminupdatedetail)


admin.get('/employecomplete', Complete_Task_form_user)

admin.put('/priority/:id', priority)

admin.get('/grouptasK' , group_read_task)

admin.delete('/deletegrouptask/:id' , deleteGroupTask)


export default admin

// 11