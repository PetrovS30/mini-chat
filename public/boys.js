const socket = io();

const nicknameBoy = document.getElementById('myNickname');
const boysChatMessage = document.getElementById('boys-chat-message');
const roomsMembers = document.getElementById('rooms-members');
const sendMessage = document.getElementById('send-message');
const text = document.getElementById('text');

nicknameBoy.innerHTML = `Привет,  ${localStorage.getItem('nickname')}!`;


socket.onAny((event, payload) => {
  console.log(`📥 Событие: ${event}`, payload);
});

socket.on('connect', () => {
    console.log('✅ Клиент подключён:', socket.id);
});


let nickname = localStorage.getItem('nickname');
let room = localStorage.getItem('room');

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
            <li><strong>${nickname}</strong></li>
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
    console.log('Получено событие newMessage:', msg.nickname); 
    console.log('Получено событие newMessage:', msg.message);
    console.log('Новый никнейм', msg.newMsgNickname);
     
    boysChatMessage.innerHTML += `
        <ul>
            <li><strong>${msg.nickname}</strong></li>
            <li>${msg.message}</li>
        </ul>
    `;

});

socket.on('redirectToHome', () => {
    window.location.href = 'http://localhost:3000';
});




