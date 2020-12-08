const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const server = await app.listen(port, () => {
    console.log(`We are Listening on port ${port}...`);
}).on("error", (err) => {
    console.log("error", err.message);
});

const io = require('socket.io').listen(server, {
    path: "/chatservices"
});

let users = {};
io.on('connection', async (socket) => {

    // INITIALIZE
    init();

    // ANNOUNCEMENT
    socket.on('announcement', (channels, data) => {
        data.createdAt = new Date();
        if (channels.length) channels.forEach(c => socket.broadcast.emit(c, data));
        else io.sockets.emit("announcement", data);
    });

    // ==== SUPPORTIVES 

    socket.on('disconnecting', (reason) => {
        // console.log('disconnecting', socket.id, soclet.userId, reason);
    });
    socket.on('disconnect', async (reason) => {
        await deInit(reason);
    });
    socket.on('error', (error) => {
        console.log('Error', socket.id, error);
    });

    // INITIALIZE
    async function init() {
        // INIT SOCKET QUERY FIELDS
        socket.userId = socket.handshake.query.userId;
        
        // ADD USER IN SOCKET USERS
        if (!users[socket.userId]) users[socket.userId] = [];
        users[socket.userId].push(socket.id);

        // TODO add user status in use table for online/offline
        console.log('connected', socket.id, socket.userId);
    }

    // DEINITIALIZE
    function deInit(reason) {
        // REMOVE FROM SOCKET USERS
        _.remove(users[socket.userId], (u) => u === socket.id);
        if (users[socket.userId].length === 0) delete users[socket.userId];

        // TODO add user status in use table for online/offline
        console.log('disconnected', socket.id, socket.userId, reason);

        // DISCONNECT SOCKET
        socket.disconnect();
    }

});