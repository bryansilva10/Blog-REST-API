//file for socket connection

let io;

module.exports = {
	init: httpServer => {
		io = require('socket.io')(httpServer);
		return io;
	},
	getIO: () => {
		//check if io is undefined...
		if (!io) {
			//throw error
			throw new Error('Socket is not initialized')
		}

		//if io has been init, return it
		return io;
	}
}