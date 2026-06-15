import express from 'express'
import { register, login ,otp ,forgotpassword ,reset_passwoad } from '../controller/Controller.js'
import { Valid_User } from '../Middleware/middleware.js'

const router = express.Router()

router.post('/register', register)

router.post('/login',login)

router.post('/otp',otp)

router.put('/forgot', forgotpassword)

router.put('/reset', reset_passwoad)


router.get('/dashboard', Valid_User, (req, res) => {
    res.send(`Welcome, ${req.user.email}. This is your dashboard.`);
});

export default router