const socket = io();
const messageContainer = document.getElementById('messages');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const typingIndicator = document.getElementById('typing');
const usersList = document.getElementById('users-list');

// Prompt for username when joining
const name = prompt('What is your name?');
if (name) {
    appendMessage('You joined the chat', 'user-join');
    socket.emit('new-user', name);
} else {
    window.location.reload();
}

// Handle form submission
messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    if (message.trim()) {
        appendMessage(`You: ${message}`, 'sent');
        socket.emit('send-chat-message', message);
        messageInput.value = '';
    }
});

// Handle typing indicator
messageInput.addEventListener('input', () => {
    socket.emit('typing');
});

let typingTimer;
socket.on('user-typing', (name) => {
    typingIndicator.textContent = `${name} is typing...`;
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        typingIndicator.textContent = '';
    }, 3000);
});

// Handle incoming messages
socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`, 'received');
});

// Handle user connections
socket.on('user-connected', name => {
    appendMessage(`${name} connected`, 'user-join');
});

// Handle user disconnections
socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`, 'user-join');
});

// Update users list
socket.on('update-users', users => {
    usersList.innerHTML = '';
    for (const [id, name] of Object.entries(users)) {
        const li = document.createElement('li');
        li.textContent = name;
        usersList.appendChild(li);
    }
});

// Helper function to append messages
function appendMessage(message, type) {
    if (type === 'user-join') {
        const messageElement = document.createElement('div');
        messageElement.classList.add(type);
        messageElement.textContent = message;
        messageContainer.append(messageElement);
    } else {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(type);
        
        const infoElement = document.createElement('div');
        infoElement.classList.add('message-info');
        infoElement.textContent = type === 'sent' ? 'You' : message.split(':')[0];
        
        const textElement = document.createElement('div');
        textElement.textContent = type === 'sent' ? message.split(':')[1] : message.split(':')[1].trim();
        
        messageElement.append(infoElement);
        messageElement.append(textElement);
        messageContainer.append(messageElement);
    }
    messageContainer.scrollTop = messageContainer.scrollHeight;
}
