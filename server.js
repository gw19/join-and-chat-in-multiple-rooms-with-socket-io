// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3232;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chat room

var numUsers = 0;
var curRoomList = [];
var logJoin = '已經加入';
var logLab = '聊天實驗室';
var logRoom = '房間 ';

io.on('connection', function (socket) {
  var addedUser = false;
  var curRoomName = '大廳';

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.to(curRoomName).emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;

    // Default to join 'Lobby'.
    socket.join(curRoomName);

    // If there is no the same curRoomName in room list, add it to room list.
    if (curRoomList.indexOf(curRoomName) === -1) {
      curRoomList.push(curRoomName);
    }

    socket.emit('show room list', curRoomList, curRoomName);

    socket.emit('login', {
      numUsers: numUsers
    });

    // echo to room (default as 'Lobby') that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers,
      logJoin: logJoin,
      logLocation: logLab,
      userJoinRoom: false
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.to(curRoomName).emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects, perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      if (numUsers === 0) {
        curRoomList = [];
      }
      // echo globally that this client has left
      socket.broadcast.to(curRoomName).emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });

  // Show room list to user.
  socket.on('room list', function () {
    socket.emit('show room list', curRoomList, curRoomName);
  });

  socket.on('join room', function (room) {
    socket.emit('stop typing');
    if (room !== curRoomName) {
      socket.leave(curRoomName);
      socket.join(room);

      // If there is no the same room in room list, add it to room list.
      if (curRoomList.indexOf(room) === -1) {
        curRoomList.push(room);
        socket.emit('join result', {
          logAction: '您已經建立房間',
          roomName: room
        });
      } else {
        socket.emit('join result', {
          logAction: '您已經加入房間',
          roomName: room
        });
      }

      socket.emit('show room list', curRoomList, room);
      curRoomName = room;
      socket.broadcast.to(room).emit('user joined', {
        username: socket.username,
        numUsers: numUsers,
        logJoin: logJoin,
        logLocation: logRoom + '「' + room + '」',
        userJoinRoom: true
      })
    }
  });
});
