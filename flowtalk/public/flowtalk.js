// FlowTalk Client-Side JavaScript
const socket = io();

// DOM Elements
const loginContainer = document.getElementById("login-container");
const chatContainer = document.getElementById("chat-container");
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const roomInput = document.getElementById("room");
const messagesDiv = document.getElementById("messages");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const roomTitle = document.getElementById("room-title");
const usersList = document.getElementById("users-list");
const leaveRoomBtn = document.getElementById("leave-room");

// Current user data
let currentUser = "";
let currentRoom = "";

// Login Form Handler
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const room = roomInput.value.trim();

  if (username && room) {
    currentUser = username;
    currentRoom = room;

    // Join the room
    socket.emit("join-room", { username, room });

    // Show chat container and hide login
    loginContainer.style.display = "none";
    chatContainer.style.display = "flex";

    // Update room title
    roomTitle.textContent = `Room: ${room}`;

    // Focus on message input
    setTimeout(() => {
      messageInput.focus();
    }, 100);
  }
});

// Message Form Handler
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const message = messageInput.value.trim();

  if (message) {
    // Send message to server
    socket.emit("chat-message", {
      username: currentUser,
      room: currentRoom,
      message: message,
      timestamp: new Date(),
    });

    // Clear input and reset height
    messageInput.value = "";
    messageInput.style.height = "auto";
    messageInput.focus();
  }
});

// Leave Room Handler
leaveRoomBtn.addEventListener("click", () => {
  socket.emit("leave-room", { username: currentUser, room: currentRoom });

  // Reset UI
  loginContainer.style.display = "flex";
  chatContainer.style.display = "none";
  messagesDiv.innerHTML = "";
  usersList.innerHTML = "";
  usernameInput.value = "";
  roomInput.value = "";

  // Reset current user data
  currentUser = "";
  currentRoom = "";

  // Focus on username input
  setTimeout(() => {
    usernameInput.focus();
  }, 100);
});

// Socket Event Listeners

// User joined room
socket.on("user-joined", (data) => {
  addSystemMessage(`${data.username} joined the room`);
  updateUsersList(data.users);
});

// User left room
socket.on("user-left", (data) => {
  addSystemMessage(`${data.username} left the room`);
  updateUsersList(data.users);
});

// New message received
socket.on("new-message", (data) => {
  addMessage(data);
});

// Room users update
socket.on("room-users", (users) => {
  updateUsersList(users);
});

// Connection status
socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
  addSystemMessage("Connection lost. Trying to reconnect...");
});

socket.on("reconnect", () => {
  console.log("Reconnected to server");
  addSystemMessage("Reconnected to server");

  // Rejoin room if we were in one
  if (currentUser && currentRoom) {
    socket.emit("join-room", { username: currentUser, room: currentRoom });
  }
});

// Helper Functions

function addMessage(data) {
  const messageElement = document.createElement("div");
  messageElement.className = "message";

  const isOwnMessage = data.username === currentUser;
  if (isOwnMessage) {
    messageElement.classList.add("own-message");
  }

  const time = new Date(data.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  messageElement.innerHTML = `
        <div class="message-header">
            <span class="message-username">${data.username}</span>
            <span class="message-time">${time}</span>
        </div>
        <div class="message-content">${escapeHtml(data.message)}</div>
    `;

  messagesDiv.appendChild(messageElement);
  scrollToBottom();
}

function addSystemMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.className = "message system-message";
  messageElement.innerHTML = `
        <div class="message-content">${escapeHtml(message)}</div>
    `;

  messagesDiv.appendChild(messageElement);
  scrollToBottom();
}

function updateUsersList(users) {
  usersList.innerHTML = "";

  users.forEach((user) => {
    const userElement = document.createElement("div");
    userElement.className = "user-item";

    if (user === currentUser) {
      userElement.classList.add("current-user");
    }

    userElement.innerHTML = `
            <span class="user-status"></span>
            <span class="user-name">${escapeHtml(user)}</span>
        `;

    usersList.appendChild(userElement);
  });
}

function scrollToBottom() {
  setTimeout(() => {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, 50);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Auto-resize message input (improved)
messageInput.addEventListener("input", function () {
  // Reset height to auto to get the correct scrollHeight
  this.style.height = "auto";

  // Set height to scrollHeight, but limit to max-height
  const maxHeight = 100; // matches CSS max-height
  if (this.scrollHeight <= maxHeight) {
    this.style.height = this.scrollHeight + "px";
  } else {
    this.style.height = maxHeight + "px";
  }
});

// Enter key to send message (Shift+Enter for new line)
messageInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    messageForm.dispatchEvent(new Event("submit"));
  }
});

// Focus username input on page load
document.addEventListener("DOMContentLoaded", () => {
  usernameInput.focus();
});

// Handle window resize
window.addEventListener("resize", () => {
  scrollToBottom();
});

// Prevent form submission on Enter in username/room inputs
usernameInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    roomInput.focus();
  }
});

roomInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    loginForm.dispatchEvent(new Event("submit"));
  }
});
