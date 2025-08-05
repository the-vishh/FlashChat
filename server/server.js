const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// Store room data
const rooms = new Map();

// Helper function to get users in a room
function getUsersInRoom(room) {
  const roomData = rooms.get(room);
  return roomData ? Array.from(roomData.users.keys()) : [];
}

// Helper function to check if username exists in room
function isUsernameAvailable(room, username) {
  if (!rooms.has(room)) {
    return true;
  }
  const roomData = rooms.get(room);
  return !roomData.users.has(username);
}

// Helper function to add user to room
function addUserToRoom(room, username, socketId) {
  if (!rooms.has(room)) {
    rooms.set(room, {
      users: new Map(),
      messages: [],
    });
  }

  const roomData = rooms.get(room);
  roomData.users.set(username, socketId);
}

// Helper function to remove user from room
function removeUserFromRoom(room, username) {
  if (rooms.has(room)) {
    const roomData = rooms.get(room);
    roomData.users.delete(username);

    // Clean up empty rooms
    if (roomData.users.size === 0) {
      rooms.delete(room);
    }
  }
}

// Helper function to get username by socket ID
function getUsernameBySocketId(socketId) {
  for (const [roomName, roomData] of rooms.entries()) {
    for (const [username, userSocketId] of roomData.users.entries()) {
      if (userSocketId === socketId) {
        return { username, room: roomName };
      }
    }
  }
  return null;
}

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining a room
  socket.on("join-room", (data) => {
    const { username, room } = data;

    // Validate username and room
    if (!username || !room || username.trim() === "" || room.trim() === "") {
      socket.emit("join-error", {
        message: "Username and room name are required",
      });
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedRoom = room.trim();

    // Check if username is already taken in this room
    if (!isUsernameAvailable(trimmedRoom, trimmedUsername)) {
      socket.emit("username-taken", {
        message: `Username "${trimmedUsername}" is already taken in room "${trimmedRoom}". Please choose a different username.`,
      });
      return;
    }

    // Leave any previous rooms
    const userData = getUsernameBySocketId(socket.id);
    if (userData) {
      socket.leave(userData.room);
      removeUserFromRoom(userData.room, userData.username);

      // Notify previous room about user leaving
      socket.to(userData.room).emit("user-left", {
        username: userData.username,
        users: getUsersInRoom(userData.room),
      });
    }

    // Join new room
    socket.join(trimmedRoom);
    addUserToRoom(trimmedRoom, trimmedUsername, socket.id);

    const usersInRoom = getUsersInRoom(trimmedRoom);

    // Notify all users in room about new user
    socket.to(trimmedRoom).emit("user-joined", {
      username: trimmedUsername,
      users: usersInRoom,
    });

    // Send current users list to the new user
    socket.emit("room-users", usersInRoom);

    // Confirm successful join
    socket.emit("join-success", {
      username: trimmedUsername,
      room: trimmedRoom,
    });

    console.log(`${trimmedUsername} joined room: ${trimmedRoom}`);
  });

  // Handle chat messages
  socket.on("chat-message", (data) => {
    const { username, room, message, timestamp } = data;

    // Verify user is actually in the room and has this username
    const userData = getUsernameBySocketId(socket.id);
    if (!userData || userData.username !== username || userData.room !== room) {
      console.log(`Unauthorized message attempt from ${socket.id}`);
      return;
    }

    // Validate message
    if (!message || message.trim() === "") {
      return;
    }

    const trimmedMessage = message.trim();

    // Store message in room history
    if (rooms.has(room)) {
      const roomData = rooms.get(room);
      roomData.messages.push({
        username,
        message: trimmedMessage,
        timestamp,
      });

      // Keep only last 100 messages per room
      if (roomData.messages.length > 100) {
        roomData.messages = roomData.messages.slice(-100);
      }
    }

    // Broadcast message to all users in the room
    io.to(room).emit("new-message", {
      username,
      message: trimmedMessage,
      timestamp,
    });

    console.log(`Message in ${room} from ${username}: ${trimmedMessage}`);
  });

  // Handle user leaving a room
  socket.on("leave-room", (data) => {
    const { username, room } = data;

    // Verify user is actually in the room
    const userData = getUsernameBySocketId(socket.id);
    if (!userData || userData.username !== username || userData.room !== room) {
      return;
    }

    socket.leave(room);
    removeUserFromRoom(room, username);

    // Notify other users in room
    socket.to(room).emit("user-left", {
      username,
      users: getUsersInRoom(room),
    });

    console.log(`${username} left room: ${room}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const userData = getUsernameBySocketId(socket.id);

    if (userData) {
      const { username, room } = userData;

      removeUserFromRoom(room, username);

      // Notify other users in room
      socket.to(room).emit("user-left", {
        username,
        users: getUsersInRoom(room),
      });

      console.log(`${username} disconnected from room: ${room}`);
    }

    console.log(`User disconnected: ${socket.id}`);
  });

  // Handle typing indicators (optional feature)
  socket.on("typing-start", (data) => {
    const userData = getUsernameBySocketId(socket.id);
    if (
      userData &&
      userData.username === data.username &&
      userData.room === data.room
    ) {
      socket.to(data.room).emit("user-typing", {
        username: data.username,
        isTyping: true,
      });
    }
  });

  socket.on("typing-stop", (data) => {
    const userData = getUsernameBySocketId(socket.id);
    if (
      userData &&
      userData.username === data.username &&
      userData.room === data.room
    ) {
      socket.to(data.room).emit("user-typing", {
        username: data.username,
        isTyping: false,
      });
    }
  });
});

// Basic route for homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// API endpoint to get room statistics (optional)
app.get("/api/stats", (req, res) => {
  const stats = {
    totalRooms: rooms.size,
    totalUsers: Array.from(rooms.values()).reduce(
      (total, room) => total + room.users.size,
      0
    ),
    rooms: Array.from(rooms.entries()).map(([name, data]) => ({
      name,
      userCount: data.users.size,
      users: Array.from(data.users.keys()),
    })),
  };

  res.json(stats);
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`FlowTalk server running on port ${PORT}`);
  console.log(`Open your browser to: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
