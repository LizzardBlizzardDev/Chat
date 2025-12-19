import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:4000");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("system-message", (data) => {
      setMessages((prev) => [...prev, { system: true, text: data.text }]);
    });

    socket.on("users-list", (data) => {
      setUsers(data);
    });

    return () => socket.off();
  }, []);

  const joinRoom = () => {
    socket.emit("join-room", { username, room });
    setJoined(true);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("send-message", { text: message });
    setMessage("");
  };

  if (!joined) {
    return (
      <div className="username-container">
        <h2>Unirse al chat, no necesitas una cuenta</h2>
        <input className="btn btn-light" placeholder="Nombre" onChange={e => setUsername(e.target.value)} />
        <input className="btn btn-light" placeholder="Sala (ej: general)" onChange={e => setRoom(e.target.value)} />
        <button className="btn btn-dark" onClick={joinRoom}>Unirse</button>
      </div>
    );
  }

  return (
    <div className="chat-layout">
      {/* Usuarios */}
      <aside className="users">
        <h4>Usuarios</h4>
        {users.map((u, i) => (
          <div key={i}>{u}</div>
        ))}
      </aside>

      {/* Chat */}
      <main className="chat">
        <div className="messages">
          {messages.map((msg, i) => (
            msg.system ? (
              <div key={i} className="system">{msg.text}</div>
            ) : (
              <div
                key={i}
                className={`message ${msg.user === username ? "me" : ""}`}
              >
                <span>{msg.user}</span>
                <p>{msg.text}</p>
              </div>
            )
          ))}
        </div>

        <div className="input-bar">
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Mensaje..."
          />
          <button className="btn btn-primary" onClick={sendMessage}><i class="bi bi-send"></i></button>
        </div>
      </main>
    </div>
  );
}

export default App;
                            