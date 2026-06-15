import express from 'express'
import { createOrganization ,deleteOrganization,getOrganizations, updateOrganization} from '../controller/organization.js';

const organization = express.Router();


organization.post('/create/:id',  createOrganization );
organization.get('/getUser/:orgid',  getOrganizations);

organization.put('/update/:orgid',  updateOrganization);
organization.delete('/delete',  deleteOrganization);

export default organization; 
