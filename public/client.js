const socket = io();

const nicknameInput = document.getElementById('nickname');
const input = document.getElementById('input');
const selectInput = document.getElementById('room');
const sendBtn = document.getElementById('send');

localStorage.clear();

sendBtn.addEventListener('click', ()=> {
    const nickname = nicknameInput.value.trim();
    const room = selectInput.value;

    if (!nickname) {
        alert('Введите никнейм');
        return;
    }

    socket.emit('joinRoomRequest', {nickname, room});
});


socket.on('roomJoinConfirmed', ({ room, nickname }) => {
    localStorage.setItem('room', room);
    localStorage.setItem('nickname', nickname);

    if (room === 'boys') {
        window.location.href = '/boys.html';
    } else if (room === 'girls') {
        window.location.href = '/girls.html';
    } else if(room === 'general'){
        window.location.href = '/general.html';
    }
});




