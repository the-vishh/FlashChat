# FlashChat ⚡
A lightning-fast, ephemeral chat application where conversations vanish when you leave - no accounts, no history, just instant messaging.

---

## ✨ Features

- ⚡ **Instant Access** – No registration or login required
- 🏠 **Room-Based Chat** – Create or join any room with just a name
- 👻 **Ephemeral Messages** – All messages disappear when you leave the room
- 🔒 **Unique Usernames** – Username validation prevents impersonation within rooms
- 🔄 **Real-time Messaging** – Powered by Socket.IO for instant communication
- 👥 **Live User List** – See who's currently in your room
- ⏰ **Message Timestamps** – Know exactly when messages were sent
- 📱 **Responsive Design** – Works seamlessly across all devices
- 🎨 **Modern UI** – Clean, intuitive WhatsApp-inspired interface
- 🚪 **Join/Leave Notifications** – System alerts when users enter or exit
- 🔄 **Auto-Reconnect** – Seamless reconnection on network interruptions

---

## 🚀 Live Demo

🖥️ **Frontend (Vercel)**: [https://flow-talk-blond.vercel.app/](https://flow-talk-blond.vercel.app/)  
🌐 **Backend (Render)**:  [https://flowtalk-na0g.onrender.com](https://flowtalk-na0g.onrender.com)

---

## 💡 The FlashChat Concept

FlashChat is built around the philosophy of **truly temporary communication**:

- **No Accounts** – Just pick a username and room name
- **No History** – Messages exist only while you're in the room
- **No Persistence** – Leave the room, lose the conversation
- **Maximum Privacy** – Nothing is stored permanently
- **Instant Connection** – Start chatting in seconds

Perfect for:
- Quick team discussions
- Temporary project coordination  
- Private conversations that shouldn't leave traces
- Anonymous group chats
- Brainstorming sessions

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Backend**: Node.js, Express.js, Socket.IO
- **Real-time Communication**: WebSocket connections
- **Deployment**: Vercel (Frontend), Render (Backend)
- **Version Control**: Git & GitHub

---

## 🔐 Security Features

- **Username Uniqueness** – Prevents impersonation within rooms
- **Input Validation** – Sanitized usernames and messages
- **Session Verification** – Server validates all user actions
- **Connection Authentication** – Messages tied to socket connections
- **XSS Protection** – HTML escaping for all user content

---

## 📁 Project Structure

```
FlashChat/
├── public/              # Frontend files
│   ├── index.html       # Main HTML structure
│   ├── flowtalk.css     # Styling and animations
│   └── flowtalk.js      # Client-side JavaScript with validation
├── server/              # Backend files
│   └── server.js        # Express server with Socket.IO and security
├── package.json         # Project dependencies and scripts
├── vercel.json          # Vercel deployment configuration
└── README.md            # Documentation
```

---

## ⚙️ Getting Started (Local Development)

1. **Clone the repository**  
   ```bash
   git clone https://github.com/the-vishh/FlashChat.git
   cd FlashChat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm start
   ```

4. **Open your browser** at `http://localhost:3000`

5. **Start chatting!**
   - Enter any username
   - Join or create a room
   - Start your ephemeral conversation

---

## 🌍 Environment URLs

| Service  | Environment | URL |
|----------|-------------|-----|
| Backend  | Production  | https://flowtalk-na0g.onrender.com |
| Frontend | Production  | https://flow-talk-blond.vercel.app/ |
| Local    | Development | http://localhost:3000 |

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Deploy to Vercel
vercel --prod
```

### Backend (Render)
- Connected to GitHub for automatic deployments
- Environment: Node.js
- Build Command: `npm install`
- Start Command: `node server/server.js`

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the project**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
   ```bash
   npm start
   # Test in multiple browsers/devices
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature: brief description"
   ```
6. **Push and create a pull request**

### 🐛 Bug Reports
- Use GitHub Issues
- Include steps to reproduce
- Mention browser/device details

### 💡 Feature Requests
- Check existing issues first
- Explain the use case
- Consider the ephemeral philosophy

---

## 📊 API Endpoints

### WebSocket Events

**Client → Server:**
- `join-room` - Join a chat room
- `chat-message` - Send a message
- `leave-room` - Leave current room

**Server → Client:**
- `join-success` - Room join confirmed
- `username-taken` - Username conflict error
- `user-joined` - Someone joined the room
- `user-left` - Someone left the room
- `new-message` - New message received

### REST API
- `GET /` - Serve main application
- `GET /api/stats` - Get server statistics (optional)

---

## 🔧 Configuration

### Environment Variables
```bash
PORT=3000                    # Server port (default: 3000)
NODE_ENV=production          # Environment mode
```

### Client Configuration
Update the Socket.IO connection URL in `flowtalk.js`:
```javascript
const socket = io("your-backend-url-here");
```

---

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## 👨‍💻 Author

Built with ⚡ by [@the-vishh](https://github.com/the-vishh)

**FlashChat** - Where conversations are as temporary as lightning ⚡

---

## ⭐️ Show Your Support

If you find FlashChat useful, please consider:
- ⭐ Starring this repository
- 🍴 Forking for your own projects  
- 🐛 Reporting bugs or suggesting features
- 💬 Sharing with others who need ephemeral chat

---

### 📝 Quick Deploy Commands:
```bash
git add .
git commit -m "Update to FlashChat with enhanced security and ephemeral messaging"
git push origin main
```

---
