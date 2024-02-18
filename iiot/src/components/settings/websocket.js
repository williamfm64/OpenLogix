// websocket.js

const socket = new WebSocket('ws://192.168.100.189:5000');

// Connection opened
socket.addEventListener('open', function (event) {
    console.log('Connected to the WS Server!')
});

// Connection closed
socket.addEventListener('close', function (event) {
    console.log('Disconnected from the WS Server!')
});

// Listen for messages
//socket.addEventListener('message', function (event) {
//    console.log('Message from server ', event.data);
//});

// Exporte a variável socket para que ela possa ser importada em outros arquivos
export { socket };