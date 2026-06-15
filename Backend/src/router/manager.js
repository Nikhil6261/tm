import express from 'express'
import { CreateByManager , deleteManager, readTaskOfManager , onlyEmployes} from '../controller/ManagerCreatedTask.js';
import { deleteGroupTask, group_read_task ,priority} from '../controller/AdminTask.js';

const Manager = express.Router()


Manager.post('/createtask' , CreateByManager);

Manager.get('/readalltask' , readTaskOfManager);

Manager.delete('/taskdelete/:id' ,deleteManager);

Manager.get('/onlyemploye', onlyEmployes)


Manager.put('/priority/:id', priority)

//group 
//gettask 
Manager.get('/grouptask' , group_read_task)

//group delete task
Manager.delete('/deletegrouptask/:id' , deleteGroupTask)



export default Manager
