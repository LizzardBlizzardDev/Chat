const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://chat-delta-steel.vercel.app",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    socket.on("join-room", ({ username, room }) => {
        if (!username || !room) return;

        socket.username = username;
        socket.room = room;

        socket.join(room);

        // Avisar a la sala
        socket.to(room).emit("system-message", {
            text: `${username} se unió al chat`
        });

        updateUsers(room);
    });

    socket.on("send-message", ({ text }) => {
        if (!socket.room || !text) return;

        io.to(socket.room).emit("receive-message", {
            user: socket.username,
            text
        });
    });

    socket.on("disconnect", () => {
        if (!socket.room) return;

        socket.to(socket.room).emit("system-message", {
            text: `${socket.username} salió del chat`
        });

        updateUsers(socket.room);
    });

    function updateUsers(room) {
        const users = Array.from(io.sockets.adapter.rooms.get(room) || [])
            .map(id => {
                const s = io.sockets.sockets.get(id);
                return s?.username;
            })
            .filter(Boolean);

        io.to(room).emit("users-list", users);
    }
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log("Servidor corriendo en puerto ", PORT);
});

