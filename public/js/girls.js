const socket = io();


const nicknameGirl = document.querySelector('#myNickname');
const roomsMembers = document.getElementById('rooms-members');
const girlsChatMessage = document.getElementById('girls-chat-message');
const sendMessage = document.getElementById('send-message');
const textV = document.getElementById('text');
const chatEnd = document.getElementById('chat-end')

let nickname = localStorage.getItem('nickname');
let room = localStorage.getItem('room');


if (!nickname || nickname.trim() === '') {
    window.location.href = '/'; 
}

nicknameGirl.innerHTML = `Привет, ${localStorage.getItem('nickname')}!`;

socket.onAny((event, payload) => {
    console.log(`Event: ${event}`, payload);
});

socket.on('connect', () => {
    console.log('✅ Клиент подключён:', socket.id);
});


socket.emit('newUserJoinedRoom', {
    nickname,
    room
});

socket.on('girlsRoom', ({ conversation, members }) => {
    console.log('📥 Получено событие girlsRoom:', { conversation, members });

    if (!Array.isArray(members) || !Array.isArray(conversation)) {
        console.warn('Некорректные данные для комнаты');
        return;
    }

    roomsMembers.innerHTML = `В женском чате сейчас: ${members.join(', ')}`;

    girlsChatMessage.innerHTML = conversation.map(({ nickname, message }) => `
        <ul>
            <li class='members-item'><strong>${nickname}</strong></li>
            <li>${message}</li>
        </ul>
    `).join('');

    girlsChatMessage.style.border = '1px solid black';
});


sendMessage.addEventListener('click', () => {
    document.getElementById('error').textContent = '';

    const text = textV.value.trim();

    const textMessage = {
        room,
        message: text, 
        nickname,
        timestamp: new Date().toISOString()
    };

    socket.emit("send-conversation", textMessage);
    textV.value = '';
});

socket.on('newMessage', (msg) => {

    girlsChatMessage.innerHTML += `
        <ul>
            <li class='members-item'><strong>${msg.nickname}</strong></li>
            <li>${msg.message}</li>
        </ul>
    `;

    while (girlsChatMessage.children.length > 20) {
        girlsChatMessage.removeChild(girlsChatMessage.firstChild);
    }
})

chatEnd.addEventListener('click', () => {
    const userExit = {
        nickname,
        room
    };
    socket.emit('endChatBoys', userExit);
});

socket.on('roomMembersUpdated', ({members}) => {
    roomsMembers.innerHTML = `В женском чате сейчас: ${members.join(', ')}`;
})

socket.on('endedChatBoys', () => {
    window.location.href = 'http://localhost:3000';
});


socket.on('girlsUserLeft', ({members}) => {
    roomsMembers.innerHTML = '';
    roomsMembers.innerHTML = `В женском чате сейчас: ${members.join(', ')}`;
});