# join-and-chat
Create or join rooms and chat with friends at any time, an web app based on Socket.io. （基於 Socket.io 之可建立 / 加入房間的即時多人聊天室）

## Introduction
Users in <strong>Join and Chat</strong> can chat with others who are in the same room, 
a new user will default to login to "Lobby" after enter a nick name, 
and enjoy chatting! The following features are in this web app: <br>

<ol>

<li>Users can create a room or join if it is exist by entering the system command: <b>/join [room name]</b>.</li>

<li>Using the join command or clicking the current room block in the room list to join the room, 
users will only see the message sent from others in this room.</li>

<li>Entering the command <b>/ls</b> will refresh the current room list. 
System will automatically refresh the room list every 30 seconds, 
while users join or leave, it will be also immediately refreshed.</li>

</ol>
<br>

## Demo
English version: https://join-and-chat-eng.herokuapp.com/<br>
中文版：https://join-and-chat.herokuapp.com/<br>
<br>

## How to use the code
Go to the project directory in cmd or bash, <br><br>
```npm install --save```<br><br>
it will install the dependent modules defined in the package.json, <br>
and then must have node.js. <br><br>
```node server/server.js```<br><br>
While the server is running, visit <b>localhost:3232</b> (port numbers are depended on you) and that's it!<br><br>

## License
MIT license.<br><br>

## Information
Author: &nbsp;GW19 &nbsp;\<imgw19@gmail.com\><br>
Hope you can give me some advices for the codes or design pattern, I will be very grateful to you.<br><br>
