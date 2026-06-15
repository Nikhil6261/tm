import express from 'express'
import {speficEmploye , joinCode} from '../controller/Employe.js'

const EmplyeRoute = express.Router()

EmplyeRoute.get('/:id', speficEmploye )

EmplyeRoute.post('/:code', joinCode )




export default EmplyeRoute