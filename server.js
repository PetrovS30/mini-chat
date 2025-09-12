const express = require('express'); 
const http = require('http'); 
const { Server } = require('socket.io');

//инициализация
const app = express(); 
const server = http.createServer(app);
const io = new Server(server); 

app.use(express.static('public'));

function logRoomsState() {
    Object.entries(rooms).forEach(([roomName, roomData]) => {
        smartLog(`📦 Комната: ${roomName}`);
        smartLog(`👥 Участники: ${roomData.members.join(', ') || '—'}`);
        smartLog(`💬 Сообщений: ${roomData.conversation.length}`);
    });
}
/* setInterval(() => {
    console.log('📊 Текущее состояние базы данных:');
    logRoomsState();
}, 7000);  */


const rooms = {
    boys : {
        conversation : [
            {id : 1 , nickname : 'Maxim', message: 'здорова ребята', timestamp: '2025-09-03T11:56:00'},
            {id : 2 , nickname : 'Serg', message: 'привет Макс', timestamp: '2025-09-03T11:56:44'},
        ],
        members : ['Maxim', "Serg"]
    },
    girls : {
        conversation : [
            {id : 1 , nickname : 'Anna', message: 'приветик девочки', timestamp: '2025-09-03T11:56:00'},
            {id : 2 , nickname : 'Sofia', message: 'привети Аня', timestamp: '2025-09-03T11:56:44'},
        ],
        members : ['Anna', "Sofia"]
    },
    general: {
        conversation : [
            {id : 1 , nickname : 'Rita', message: 'Всем по привету', timestamp: '2025-09-03T11:56:00'},
            {id : 2 , nickname : 'Lena', message: 'Хелоу', timestamp: '2025-09-03T11:56:44'},
        ],
        members : ['Rita', "Lena"]
    }
};




function smartLog(...args) {
    const stack = new Error().stack.split('\n')[2];
    const location = stack.match(/\((.*)\)/)?.[1] || stack;
    console.log(`[${location}]`, ...args);
}

io.on('connection', (socket) => {
    /* smartLog("Клиент подключился:", socket.id); */

    socket.onAny((event, payload) => {
        smartLog(` ${socket.id} отправил событие: ${event}`);
    });

    socket.on("joinRoomRequest", ({ nickname, room }) => {
        const currentRoom = rooms[room];

        if (!currentRoom) {
            socket.emit('errorMessage', 'Комната не найдена');
            return;
        }

        if (currentRoom.members.includes(nickname)) {
            socket.emit('nicknameError', 'Никнейм уже занят');
            return;
        }

        // Отправляем подтверждение на клиент client.js
        socket.emit('roomJoinConfirmed', {
            room,
            nickname
        });
    
    });

    socket.on('newUserJoinedRoom', ({nickname, room}) => {
        smartLog('📥 join2Room от клиента:', nickname, room);

        if(!nickname || !room ) {
            socket.emit('redirectToHome');
            return;
        }

        const currentRoom = rooms[room];
        if (!currentRoom) return;

        // Добавляем участника, если его ещё нет
        if (!currentRoom.members.includes(nickname)) {
            currentRoom.members.push(nickname);
        }

        socket.nickname = nickname;
        socket.room = room;
        socket.join(room);

        let eventName;

        if (room === 'boys') {
            eventName = 'boysRoom';
        } else if (room === 'girls') {
            eventName = 'girlsRoom';
        } else if (room === 'general') {
            eventName = 'generalRoom';
        }

        if (eventName) {
            io.to(room).emit(eventName, {
                conversation: currentRoom.conversation,
                members: currentRoom.members
            });
        }

        smartLog(`✅ ${nickname} добавлен в ${room}`);
    });

    socket.on('send-conversation', (sendMessage) => {
        console.log(sendMessage);
        const {room, message, nickname} = sendMessage;


        if(!nickname  || !message || !room) {
            socket.emit('redirectToHome');
            return;
        }

        if(sendMessage) {
            const newId = rooms[room].conversation.length + 1;

            const messageWithId = {
                id: newId,
                ...sendMessage,
                newMsgNickname: rooms[room].members
            };

            rooms[room].conversation.push(messageWithId);

            io.to(room).emit('newMessage', messageWithId);

            console.log('Отправлено событие newMessage:', messageWithId);
        }
    });

    //girls


    socket.on('disconnect', () => {
        const { nickname, room } = socket;
        if (nickname && room && rooms[room]) {
            rooms[room].members = rooms[room].members.filter(name => name !== nickname);
            io.to(room).emit('boysRoom', {
                boysMessage: rooms[room].conversation,
                boysMembers: rooms[room].members
            });
            smartLog(`❌ ${nickname} отключился и удалён из ${room}`);
        }
    });

});

    console.log('----------------------------------------------------------');


server.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});


