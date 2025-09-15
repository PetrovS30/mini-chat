const socket = io();

const nicknameBoy = document.getElementById('myNickname');
const boysChatMessage = document.getElementById('boys-chat-message');
const roomsMembers = document.getElementById('rooms-members');
const sendMessage = document.getElementById('send-message');
const text = document.getElementById('text');
const chatEnd = document.getElementById('chat-end');

let nickname = localStorage.getItem('nickname');
let room = localStorage.getItem('room');

if (!nickname || nickname.trim() === '') {
    window.location.href = '/'; 
}

nicknameBoy.innerHTML = `Привет,  ${localStorage.getItem('nickname')}!`;

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

socket.on('boysRoom', ({ conversation, members }) => {
    console.log('📥 Получено событие boysRoom:', { conversation, members });

    if (!Array.isArray(members) || !Array.isArray(conversation)) {
        console.warn('Некорректные данные для комнаты');
        return;
    }

    roomsMembers.innerHTML = `В мужском чате сейчас: ${members.join(', ')}`;

    boysChatMessage.innerHTML = conversation.map(({ nickname, message }) => `
        <ul>
            <li class='members-item'><strong>${nickname}</strong></li>
            <li>${message}</li>
        </ul>
    `).join('');

    boysChatMessage.style.border = '1px solid black';
});


sendMessage.addEventListener('click', () => {
    document.getElementById('error').textContent = '';
    const nickname = localStorage.getItem('nickname');

    const textMessage = text.value;

    if(textMessage === '') {
        document.getElementById('error').textContent = 'Текстовое поле не может быть пустым!';
        return;
    }

    const sendNewMsg = {
        room,
        nickname,
        message: text.value.trim(),
        timestamp: new Date().toISOString()
    };

    socket.emit('send-conversation', sendNewMsg);
    text.value = '';
});


// ✅ Подписка на новое сообщение — должна быть отдельно!
socket.on('newMessage', (msg) => {

    boysChatMessage.innerHTML += `
        <ul>
            <li class='members-item'><strong>${msg.nickname}</strong></li>
            <li>${msg.message}</li>
        </ul>
    `;
    
    while (boysChatMessage.children.length > 20) {
        boysChatMessage.removeChild(boysChatMessage.firstChild);
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
    roomsMembers.innerHTML = `В мужском чате сейчас: ${members.join(', ')}`;
})

socket.on('endedChatBoys', () => {
    window.location.href = 'http://localhost:3000';
});

socket.on('girlsUserLeft', ({members}) => {
    roomsMembers.innerHTML = '';
    roomsMembers.innerHTML = `В мужском чате сейчас: ${members.join(', ')}`;
});