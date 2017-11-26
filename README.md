# join-and-chat （聊天實驗室）
動態即時多人聊天室（可建立 / 加入房間），基於 node.js + Socket.io + Express。<br>

![version](https://img.shields.io/badge/version-1.6.5-green.svg)

![join-and-chat](https://cloud.githubusercontent.com/assets/24193072/26714744/837dccfc-47a5-11e7-86e0-953f63dd9c77.png)<br><br>

## Introduction
在<strong>聊天實驗室</strong>中，使用者登入並輸入暱稱之後會被預設加入「大廳」，並能與其他在同一個房間內的使用者對話。這個應用程式具有以下特徵：<br>

<ol>

<li>使用者可以輸入系統指令：<b>/join [room name]</b> 來建立房間，如果房間已經存在則加入它。</li>

<li>除了 /join 指令之外，點選右方房間列表中的房間區塊也能直接加入。紅色背景的房間為您目前所在的房間，括號中為該房間內人數。</li>

<li>輸入指令 <b>/ls</b> 會刷新房間列表，系統每 30 秒刷新一次，如果使用者加入∕離開聊天實驗室或建立∕加入房間，所有人都會自動刷新列表。</li>

</ol>
<br>

## Demo
English version: <a href='https://join-and-chat-eng.herokuapp.com/' target='_blank'>https://join-and-chat-eng.herokuapp.com/</a><br>
中文版：<a href='https://join-and-chat.herokuapp.com/' target='_blank'>https://join-and-chat.herokuapp.com/<a><br>
<br>

## How to use the code
 必須先安裝 node.js<br>
 在命令提示字元進入專案的路徑後輸入：<br><br>
```npm install --save```<br><br>
它會為您安裝 package.json 中定義的相依模組，完成後輸入：<br><br>
```node server/server.js```<br><br>
這會啟動本地端伺服器，打開瀏覽器在網址輸入 <b>localhost:3232</b> （port 可自行在程式碼中更改) and that's it!<br><br>

## License
MIT license.<br><br>

## Information
Author: &nbsp;GW19 &nbsp;\<imgw19@gmail.com\><br>
如果您認為程式碼有任何需要改進的地方拜託告訴我，我會非常感謝您！ <br><br>

