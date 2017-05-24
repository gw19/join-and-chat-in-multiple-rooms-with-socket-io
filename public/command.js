/**
 * Created by GW on 2017/5/24.
 */

var Command = function (socket) {
  this.socket = socket;
};

Command.prototype.changeRoom = function (room) {
  this.socket.emit('join room', {
    newRoom: room
  });
};

Command.prototype.processCommand = function (inputCmd) {
  var words = inputCmd.split(' ');
  var cmd = words[0]
    .substring(1, words[0].length)
    .toLowerCase();
  var message = false;

  switch (cmd) {
    case 'join':
      words.shift();
      var room = words.join(' ');
      this.changeRoom(room);
      break;

    default:
      message = '您輸入了無效的指令';
      break;
  }

  return message;
};
