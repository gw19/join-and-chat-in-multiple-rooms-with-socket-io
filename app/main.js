// Author: GW19 <imgw19@gmail.com>
// Based on Socket.io

$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#008dff', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7',
    '#CC9014', '#FF6C00', '#7900ff', '#14CC78',
    '#001bff', '#00b2d8', '#7900ff', '#00d877',
    '#4d7298', '#795da3', '#f47577', '#db324d',
    '#EE4035', '#F3A530', '#56B949', '#30499B',
    '#F3A530', '#56B949', '#844D9E', '#4e1c81'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // login page
  var $chatPage = $('.chat.page'); // Chat room page
  var $roomPage = $('.room.page'); // Room list page
  var $roomList = $('.room-list'); // Room list <ul>
  var $btnTips = $('.btn-tips'); // Tool buttons

  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();
  var $roomDiv;
  var roomNameRule = /^[a-zA-Z0-9_\u4e00-\u9fa5 \f\n\r\t\v]{1,14}$/;

  var socket = io();

  function addParticipantsMessage (data) {
    var message;
    if (!data.userJoinOrLeftRoom) {
      if (data.numUsers === 1) {
        message = '目前只有你一個人在這裡唷！';
      } else {
        message = '目前總共有 ' + data.numUsers + ' 位旅客在聊天實驗室。';
      }
    }
    log(message);
  }

  // Sets the client's username
  function setUsername () {
    // If user name is input, get and then emit 'add user' event.
    // trim(): remove the whitespace from the beginning and end of a string.
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $roomPage.fadeIn();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
  }

  // Sends a chat message.
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (connected) {
      $inputMessage.val('');
      if (message.charAt(0) !== '/') {
        addChatMessage({
          username: username,
          message: message
        });
        // tell server to execute 'new message' and send along one parameter
        socket.emit('new message', message);

        // If input a command with '/'.
      } else {
        inputCommand(message);
      }
    }
  }

  // Sends a command.
  function inputCommand (message) {
    var words = message.split(' ');
    var cmd = words[0]
      .substring(1, words[0].length)
      .toLowerCase();

    switch (cmd) {
      // Command /join [room name] = join room.
      case 'join':
        words.shift();
        var room = words.join(' ');
        if (roomNameRule.test(room)) {
          socket.emit('join room', room);
          //noinspection JSUnresolvedVariable
          $roomList[0].scrollTop = $roomList[0].scrollHeight;
        } else {
          log('房間名稱長度限制為 1～14 個字元，' +
              '並只能由中文、英文、數字及底線所組成', {})
        }
        break;

      // Command /ls = reload room list.
      case 'ls':
        socket.emit('room list');
        break;

      default:
        message = '您輸入了無效的指令';
        log(message);
        break;
    }
  }

  // Log a message
  function log (message, options) {
    options = options || {};
    var $logDiv;

    if (typeof options.userConnEvent !== 'undefined') {
      var userName = options.username;
      var colorOfUserName = getUsernameColor(userName);
      var $usernameDiv = $('<span class="username">')
        .text(userName)
        .css('color', colorOfUserName);
      // var $logBodyDiv = $('<span>').text(message);
      $logDiv = $('<li>')
        .addClass('log')
        .append($usernameDiv, message);
      addMessageElement($logDiv, options);
    } else {
      $logDiv = $('<li>').addClass('log').text(message);
      addMessageElement($logDiv, options);
    }
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var userName = data.username;
    var colorOfUserName = getUsernameColor(userName);
    if (data.typing !== true) {
      userName += ': ';
    }
    if (data.message !== ''){
      var $usernameDiv = $('<span class="username"/>')
        .text(userName)
        .css('color', colorOfUserName);
      var $messageBodyDiv = $('<span class="messageBody">')
        .text(data.message);

      var typingClass = data.typing ? 'typing' : '';
      var $messageDiv = $('<li class="message"/>')
        .data('username', userName)
        .addClass(typingClass)
        .append($usernameDiv, $messageBodyDiv);

      addMessageElement($messageDiv, options);
    }
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = '正在輸入訊息...';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    // When sending message, make screen to last message (here is bottom).
    //noinspection JSUnresolvedVariable
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function () {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username.
  function getUsernameColor (username) {
    var eachCharCode = 0;
    var randIndex;
    for (var ii = 0; ii < username.length; ii++) {
      eachCharCode += username.charCodeAt(ii);
    }
    randIndex = Math.abs(eachCharCode % COLORS.length);
    return COLORS[randIndex];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    //noinspection JSUnresolvedVariable
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = '● 歡迎來到聊天實驗室 ●';
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    log(data.logAction + data.logLocation + data.roomName, {
      userConnEvent: true,
      username: data.username
    });
    addParticipantsMessage(data);
    socket.emit('room list');
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.logAction + data.logLocation + data.roomName, {
      userConnEvent: true,
      username: data.username
    });
    addParticipantsMessage(data);
    removeChatTyping(data);
    // Reload room list.
    socket.emit('room list');
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });

  socket.on('disconnect', function () {
    log('您已經中斷連線');
    // Reload room list.
    socket.emit('room list');
  });

  socket.on('reconnect', function () {
    log('您已經重新連線');
    if (username) {
      socket.emit('add user', username);
      // Reload room list.
      socket.emit('room list');
    }
  });

  socket.on('reconnect_error', function () {
    log('重新連線失敗...');
  });

  // Show current room list.
  socket.on('show room list', function (room, rooms) {
    $roomList.empty();
    var roomClassName = room.trim().toLowerCase().replace(/\s/g,'');

    $.each(rooms, function (roomName, numUserInRoom) {
      // Set class name of room's <div> to be clear.
      var className = roomName.trim().toLowerCase().replace(/\s/g,'');
      $roomDiv = $('<div class="room"></div>')
        .html('<b>' + roomName + '</b>'
          + '<span class="user-number-in-room">'
          + '(' + numUserInRoom + '人' + ')' + '</span>')
        .addClass(className)
        .click(function () {
          socket.emit('join room', roomName);
          $inputMessage.focus();
        });
      $roomList.append($roomDiv);
    });

    $('.' + roomClassName).addClass('joined-room');
  });

  socket.on('join left result', function (data) {
    // log results.
    log(data.username + data.logAction
      + data.logLocation + data.roomName, {});
  });

  // Every 30 secs. reload current room list.
  setInterval(function () {
    socket.emit('room list');
  }, 30000);


  // jQuery UI Style
  $roomList.sortable();
  $btnTips.tooltip();
  $btnTips.on( "click", function() {
    $('#effect-tips').toggle('blind');
  });
});
