const socket = io();

const nicknameGeneral = document.getElementById('nicknameGeneral');
const roomMembers = document.getElementById('rooms-members'); 
const generalChatMessage = document.getElementById('general-chat-message');
const sendMessage = document.getElementById('send-message');
const text = document.getElementById('text');

let nickname = localStorage.getItem('nickname');
let room = localStorage.getItem('room');

nicknameGeneral.innerHTML = `Привет, ${nickname} !`;

socket.emit('newUserJoinedRoom', {
    nickname,
    room
});

socket.on('generalRoom', ({conversation, members}) => {
    roomMembers.innerHTML = `В общем чате сейчас: ${members.join(', ')}`;

    generalChatMessage.innerHTML = conversation.map((item,i) => {
        return `
            <ul>
                <li>${item.nickname}</li>
                <li>${item.message}</li>
            </ul>
        `;
    }).join('');
    generalChatMessage.style.border = '1px solid black';
});

sendMessage.addEventListener('click', () => {
    document.getElementById('error').textContent = '';
/*     const nickname = localStorage.getItem('nickname');
 */
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
            <li><strong>${msg.nickname}</strong></li>
            <li>${msg.message}</li>
        </ul>
    `;

});

socket.on('redirectToHome', () => {
    window.location.href = 'http://localhost:3000';
});


/* document.querySelector('.chat-end').addEventListener('click', () => {
    window.location.href = 'http://localhost:3000';
}); */