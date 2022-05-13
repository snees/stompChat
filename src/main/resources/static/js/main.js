'use strict';

var waitingPage=  document.querySelector("#waiting-page");
var usernamePage = document.querySelector('#username-page'); // 첫 실행 화면
var chatPage = document.querySelector('#chat-page'); // 채팅화면
var usernameForm = document.querySelector('#usernameForm'); // 이름 입력 폼
var messageForm = document.querySelector('#messageForm'); // 메시지 입력 창 + sendbutton
var messageInput = document.querySelector('#message'); // 메시지 입력 창
var messageArea = document.querySelector('#messageArea'); // 채팅이 보여지 곳  
var connectingElement = document.querySelector('.connecting');
var chatRequest = document.querySelector("#chat-request");


var stompClient = null;
var re_username = null;
var username = null;
// var notification = new Notification(title, options) // title: 알림창의 제목, options 알림창에 들어갈 내용(객체형태로 전달)

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function randomString() {
	const chars = '0123456789ABCDEFGHIJKLMOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	const stringLength = 5;
	let randomstring = '';
	for(let i=0; i<stringLength; i++){
		const rnum = Math.floor(Math.random()*chars.length)
		randomstring += chars.substring(rnum, rnum+1)
	}
	return randomstring;
}

function connect() { // 연결 
    
    re_username = randomString();
    //username = ; // onclick을 누른 버튼의 name을 받아 username에 넣기
	
    if(re_username) {
		waitingPage.classList.add('hidden');
        usernamePage.classList.add('hidden'); // usernamePage에 hidden클래스를 추가하여 css쪽에서 display:none으로 안보이게 함
        chatPage.classList.remove('hidden');

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault(); // 이벤트에 대한 기본 동작을 실행하지 않도록 지정
}


function onConnected() {// 성공하면 /topic/public 주제에 가입하여 메시지를 주고 받음
    
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public/' + username, onMessageReceived);
    stompClient.subscribe('/topic/public/' + re_username, onMessageReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.addUser/"+ username, {}, JSON.stringify({sender: username, type: 'JOIN'}))
    stompClient.send("/app/chat.addUser/"+ re_username, {}, JSON.stringify({sender: re_username, type: 'JOIN'}))

    connectingElement.classList.add('hidden');
}


function onError(_error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

function sendMessage(event) {
    var messageContent = messageInput.value.trim(); // messageInput에서 메시지 받아오기

    if(messageContent && stompClient) {
        var chatMessage = {
            sender: re_username,
            content: messageInput.value,
            type: 'CHAT'
        };
		
        stompClient.send("/app/chat.sendMessage/" + re_username, {}, JSON.stringify(chatMessage));
        messageInput.value = ''; // 다음 입력을 위해 messageInput 비워주기
    }
    event.preventDefault();
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li'); // li형태 만들기

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i'); //프로필
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

		//사용자의 이름을 <span>으로 묶기
        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }
	
	//메시지를 p로 묶기
    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement); 

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    var index = Math.abs(hash % colors.length);
    return colors[index];
}

//chatRequest.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)
