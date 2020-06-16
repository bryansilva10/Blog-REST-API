const express = require('express');
const { body } = require('express-validator/check');

const User = require('../models/user'); //import user model
const authController = require('../controllers/auth'); //import auth controller
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put('/signup', [
	body('email')
		.isEmail()
		.withMessage('Please enter valid email')
		//custom validation to check if email already exists in db 
		.custom((value, { req }) => {
			//use model to find one
			return User.findOne({ email: value }).then(userDoc => {
				//if user doc already exists/is found
				if (userDoc) {
					//fail...
					return Promise.reject('Email already exists');
				}
			})
		})
		.normalizeEmail(),
	body('password').trime().isLength({ min: 5 }),
	body('name').trim().not().isEmpty()
], authController.signup);

//route for auth
router.post('/login', authController.login);

//route to get the status
router.get('/status', isAuth, authController.getUserStatus);

//route to change status
router.patch('/status', isAuth, [
	body('status')
		.trim()
		.not()
		.isEmpty()
], authController.updateUserStatus);

module.exports = router;