const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

//configure file storage
const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		cb(null, new Date().toISOString() + '-' + file.originalname);
	}
});

//set mime type file filters
const fileFilter = (req, file, cb) => {
	//check if mime type is png or jpg or jpeg
	if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
		//return callback with true
		cb(null, true);
	} else {
		cb(null, false);
	}
}

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
//register multer middleware
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

//set middleware for error handling
app.use((error, req, res, next) => {
	//log error to see
	console.log(error);
	//exctract error code
	const status = error.statusCode || 500;
	//extract message
	const message = error.message;
	//extract error data
	const data = error.data;

	//return error in response with status and json data
	res.status(status), json({ message: message, data: data });

})

mongoose.connect('mongodb+srv://admin-bryan:notapassword@cluster0-mnqtb.mongodb.net/messages?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true })
	.then(result => {
		const server = app.listen(8080)
		//establish socket connection by requiring the socket file containing the connection, use its init function and pass the server
		const io = require('./socket').init(server)
		//listen to connections from every client
		io.on('connection', socket => {
			console.log('Client connected!')
		})
	}).catch(err => console.log(err))