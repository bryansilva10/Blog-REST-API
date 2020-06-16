//midleware for authentication

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	//get header and check if it is undedfined
	const authHeader = req.get('Authorization');
	if (!authHeader) {
		//create error
		const error = new Error('Not Authenticated');
		error.statusCode = 401;
		throw error;
	}
	//get token from requst header and store token
	const token = authHeader.split(' ')[1];

	//variable for decoded token
	let decodedToken;

	//try to verify the token
	try {
		//verify will decode and validate token using the secret private key
		decodedToken = jwt.verify(token, 'longsecret');
	} catch (err) {
		//add status code and throw
		err.statusCode = 500;
		throw err;
	}

	//if token was not verified for some other reason rather than failure
	if (!decodedToken) {
		//create new error
		const error = new Error('Not authenticated');
		error.statusCode = 401;
		throw error;
	}

	//if token is valid
	//extract user id from token and store it in the request
	req.userId = decodedToken.userId;
	//forward request
	next();
}