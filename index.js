//The basic declaration or setup
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = process.env.PORT || 3000;

//The variable declaraion
var userNames = {};
var userCount = 0;


server.listen(port, function(){
	console.log("Listening to port : %d", port);
});

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
	
	var userAdded = false;

	socket.on('new message', function(data){
		socket.broadcast.emit('new message', {
			username : socket.username,
			message : data
		});
	});

	socket.on('add user', function(username){
		socket.username = username;

		userNames[username] = username;
		++userCount;
		userAdded = true;
		socket.emit('login', {
			userCount : userCount;
		});

		socket.broadcast.emit('user joined', {
			username : socket.username,
			userCount : userCount
		});
	});

	socket.on('typing', function(){
		socket.broadcast.emit('typing', {
			username : socket.username
		});
	});

	socket.on('stop typing', function(){
		socket.broadcast.emit('stop typing', {
			username : socket.username
		})
	});

	socket.on('disconnect', function(){
		if(userAdded){
			delete userNames[socket.username];
			--userCount;

			socket.broadcast.emit('user left', {
				username : socket.username,
				userCount : userCount;
			})
		}
	});

});

