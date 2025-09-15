const socket = io();

const myNickname = document.getElementById('my-nickname');
const selectInput = document.getElementById('room');
const sendBtn = document.getElementById('send');

localStorage.clear();

sendBtn.addEventListener('click', ()=> {
    const nickname = myNickname.value.trim();
    const room = selectInput.value;

    if (!nickname) {
        alert('Введите никнейм');
        return;
    }

    if (nickname.length > 10) {
        alert('Максимум 10 символов');
        return;
    }

    if (nickname.length <= 2) {
        alert('Минимум 3 символа ');
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




