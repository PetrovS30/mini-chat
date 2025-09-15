const socket = io();

const nicknameGeneral = document.getElementById('myNickname');
const roomMembers = document.getElementById('rooms-members'); 
const generalChatMessage = document.getElementById('general-chat-message');
const sendMessage = document.getElementById('send-message');
const text = document.getElementById('text');
const chatEnd = document.getElementById('chat-end');


let nickname = localStorage.getItem('nickname');
let room = localStorage.getItem('room');

if (!nickname || nickname.trim() === '') {
    window.location.href = '/'; 
}

nicknameGeneral.innerHTML = `Привет, ${nickname}!`;

socket.onAny((event, payload) => {
  console.log(`📥 Событие: ${event}`, payload);
});

socket.on('connect', () => {
    console.log('✅ Клиент подключён:', socket.id);
});

socket.emit('newUserJoinedRoom', {
    nickname,
    room
});

socket.on('generalRoom', ({conversation, members}) => {
    console.log('📥 Получено событие generalRoom:', { conversation, members });

    roomMembers.innerHTML = `В общем чате сейчас: ${members.join(', ')}`;

    generalChatMessage.innerHTML = conversation.map((item,i) => {
        return `
            <ul>
                <li class='members-item'><strong>${item.nickname}</strong></li>
                <li>${item.message}</li>
            </ul>
        `;
    }).join('');

    generalChatMessage.style.border = '1px solid black';
});

sendMessage.addEventListener('click', () => {
    document.getElementById('error').textContent = '';

    const textV = text.value;

    if(textV === '') {
        document.getElementById('error').textContent = 'Текстовое поле не может быть пустым!';
        return;
    }

    const sendNewMsg = {
        room,
        nickname,
        message: textV.trim(),
        timestamp: new Date().toISOString()
    };

    socket.emit('send-conversation', sendNewMsg);
    text.value = '';
});


// ✅ Подписка на новое сообщение — должна быть отдельно!
socket.on('newMessage', (msg) => {

    generalChatMessage.innerHTML += `
        <ul>
            <li class='members-item'><strong>${msg.nickname}</strong></li>
            <li>${msg.message}</li>
        </ul>
    `;

    while (generalChatMessage.children.length > 20) {
        generalChatMessage.removeChild(generalChatMessage.firstChild);
    }

});

socket.on('redirectToHome', () => {
    window.location.href = 'http://localhost:3000';
});


chatEnd.addEventListener('click', () => {
    const userExit = {
        nickname,
        room
    };
    socket.emit('endChatBoys', userExit);
});

socket.on('roomMembersUpdated', ({members}) => {
    console.log(members);
    roomMembers.innerHTML = `В общем чате сейчас: ${members.join(', ')}`;
})

socket.on('endedChatBoys', () => {
    window.location.href = 'http://localhost:3000';
});

socket.on('girlsUserLeft', ({members}) => {
    roomsMembers.innerHTML = '';
    roomMembers.innerHTML = `В общем чате сейчас: ${members.join(', ')}`;
});