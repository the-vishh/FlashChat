// FlashChat Client-Side JavaScript
// Auto-detect if running locally or in production
const socket = io(
  window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://flashchat-lhed.onrender.com/"
);

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
let isJoining = false;

// Create error message element
function createErrorMessage(message) {
  // Remove existing error messages
  const existingErrors = document.querySelectorAll(".error-message");
  existingErrors.forEach((error) => error.remove());

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.style.cssText = `
    color: #ff4444;
    background: #ffe6e6;
    border: 1px solid #ffcccc;
    padding: 10px;
    margin: 10px 0;
    border-radius: 5px;
    font-size: 14px;
  `;
  errorDiv.textContent = message;

  loginForm.insertBefore(errorDiv, loginForm.firstChild);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
}

// Login Form Handler
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (isJoining) return; // Prevent multiple join attempts

  const username = usernameInput.value.trim();
  const room = roomInput.value.trim();

  if (!username || !room) {
    createErrorMessage("Please enter both username and room name");
    return;
  }

  if (username.length > 20) {
    createErrorMessage("Username must be 20 characters or less");
    return;
  }

  if (room.length > 30) {
    createErrorMessage("Room name must be 30 characters or less");
    return;
  }

  // Validate username (no special characters that could cause issues)
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    createErrorMessage(
      "Username can only contain letters, numbers, underscores, and hyphens"
    );
    return;
  }

  isJoining = true;

  // Disable form while joining
  usernameInput.disabled = true;
  roomInput.disabled = true;

  // Join the room
  console.log("Sending join-room event:", { username, room });
  socket.emit("join-room", { username, room });
});

// Message Form Handler
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const message = messageInput.value.trim();

  if (message && currentUser && currentRoom) {
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
  if (currentUser && currentRoom) {
    socket.emit("leave-room", { username: currentUser, room: currentRoom });
  }

  resetToLogin();
});

// Reset to login screen
function resetToLogin() {
  // Reset UI
  loginContainer.style.display = "flex";
  chatContainer.style.display = "none";
  messagesDiv.innerHTML = "";
  usersList.innerHTML = "";

  // Re-enable form
  usernameInput.disabled = false;
  roomInput.disabled = false;
  isJoining = false;

  // Reset current user data
  currentUser = "";
  currentRoom = "";

  // Focus on username input
  setTimeout(() => {
    usernameInput.focus();
  }, 100);
}

// Socket Event Listeners

// Join success
socket.on("join-success", (data) => {
  console.log("Join success received:", data);
  currentUser = data.username;
  currentRoom = data.room;

  // Show chat container and hide login
  loginContainer.style.display = "none";
  chatContainer.style.display = "flex";

  // Update room title
  roomTitle.textContent = `Room: ${data.room}`;

  // Clear any error messages
  const existingErrors = document.querySelectorAll(".error-message");
  existingErrors.forEach((error) => error.remove());

  // Focus on message input
  setTimeout(() => {
    messageInput.focus();
  }, 100);

  isJoining = false;
});

// Username taken error
socket.on("username-taken", (data) => {
  createErrorMessage(data.message);
  usernameInput.disabled = false;
  roomInput.disabled = false;
  isJoining = false;
  usernameInput.focus();
  usernameInput.select();
});

// Join error
socket.on("join-error", (data) => {
  createErrorMessage(data.message);
  usernameInput.disabled = false;
  roomInput.disabled = false;
  isJoining = false;
  usernameInput.focus();
});

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
  console.log("Connected to server", socket.id);
  // Remove any connection error messages
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((msg) => {
    if (msg.textContent.includes("Unable to connect")) {
      msg.remove();
    }
  });
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

// Connection error
socket.on("connect_error", (error) => {
  console.log("Connection error:", error);
  if (isJoining) {
    createErrorMessage(
      "Unable to connect to server. Please ensure the server is running and try again."
    );
    usernameInput.disabled = false;
    roomInput.disabled = false;
    isJoining = false;
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
    if (!isJoining) {
      loginForm.dispatchEvent(new Event("submit"));
    }
  }
});

// Handle browser back button or page refresh
window.addEventListener("beforeunload", (e) => {
  if (currentUser && currentRoom) {
    socket.emit("leave-room", { username: currentUser, room: currentRoom });
  }
});
