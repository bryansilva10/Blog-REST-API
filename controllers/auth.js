const User = require('../models/user'); //import user model
const bcrypt = require('bcryptjs'); //import module to hash password
const jwt = require('jsonwebtoken');//package to generate token

const { validationResult } = require('express-validator/check'); //import validation error results
const user = require('../models/user');

//method for sign up action
exports.signup = (req, res, next) => {
	//get validation error results coming from request
	const errors = validationResult(req);

	//if there are errors
	if (!errors.isEmpty()) {
		//create new error
		const error = new Error('Validation Failed');
		//add status code
		error.statusCode = 422;
		//store array of errors
		error.data = errors.array()
		//throw
		throw error;
	}

	//extract info from reqst
	const email = req.body.email;
	const name = req.body.name;
	const password = req.body.password;

	//hash password with strength/salt of 12
	bcrypt.hash(password, 12)
		.then(hashedPw => {
			//create a user
			const user = new User({
				email: email,
				password: hashedPw,
				name: name
			})
			//save user to db
			return user.save();
		})
		.then(result => {
			//response after saving
			res.status(201).json({ message: 'User created', userId: result._id })
		})
		.catch(err => {
			//check if the error does not have a status code
			if (!err.statusCode) {
				//set the code
				err.statusCode = 500;
			}
			//since this is inside async code (promise) we need to use next to go to next middleware
			next(err);
		})
}

//method for login route
exports.login = (req, res, next) => {
	//extract info from request
	const email = req.body.email;
	const password = req.body.password;

	//variable for user found
	let loadedUser;

	//find if that user already exists
	User.findOne({ email: email })
		.then(user => {
			//if user is not defined
			if (!user) {
				//create new error
				const error = new Error('User could not be found');
				error.statusCode = 401;
				//throw error
				throw error;
			}

			//if we have a user with that email...
			loadedUser = user;
			//compara passowrd with password stored
			return bcrypt.compare(password, user.password);
		})
		.then(isEqual => {
			//if passwords are not equal...
			if (!isEqual) {
				//create error
				const error = new Error('Wrong Password');
				error.statusCode = 401;
				throw error;
			}

			//if password is equal/correct
			//generate token
			const token = jwt.sign({ email: loadedUser.email, userId: loadedUser._id.toString() }, 'longsecret', { expiresIn: '1h' });
			res.status(200).json({ token: token, userId: loadedUser._id.toString() })

		})
		.catch(err => {
			//check if the error does not have a status code
			if (!err.statusCode) {
				//set the code
				err.statusCode = 500;
			}
			//since this is inside async code (promise) we need to use next to go to next middleware
			next(err);
		})
}

//controller to get user status
exports.getUserStatus = (req, res, next) => {
	//get user
	User.findById(req.userId)
		.then(user => {
			//if the user is not defned
			if (!user) {
				//create and throw error
				const error = new Error('User not found');
				error.statusCode = 404;
				throw error;
			}

			//if we have the user
			//return reponse
			res.status(200).json({ status: user.status });
		})
		.catch(err => {
			//set a sttu code if there isnt one
			if (!err.statusCode) {
				//set the code
				err.statusCode = 500;
			}
			//since this is inside async code (promise) we need to use next to go to next middleware
			next(err);
		})
}

//controller to edit user status
exports.updateUserStatus = (req, res, next) => {
	//grab status
	const newStatus = req.body.status;

	//find user
	User.findById(req.userId)
		.then(user => {
			if (!user) {
				//create and throw error
				const error = new Error('User not found');
				error.statusCode = 404;
				throw error;
			}

			//set status and save
			user.status = newStatus;
			return user.save();

		})
		.then(result => {
			//set status and return response
			res.status(200).json({ message: 'User updated' });
		})
		.catch(err => {
			//set a sttu code if there isnt one
			if (!err.statusCode) {
				//set the code
				err.statusCode = 500;
			}
			//since this is inside async code (promise) we need to use next to go to next middleware
			next(err);
		})
}