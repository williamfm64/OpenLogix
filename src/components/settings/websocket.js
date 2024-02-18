let serverIP;
let socket = null;

const socketPromise = new Promise((resolve, reject) => {
    fetch('/getServerIP.php')
        .then(response => response.text())
        .then(receivedServerIP => {
            serverIP = receivedServerIP.trim();
            console.log('Endereço IP do servidor:', serverIP);

            // Após receber o endereço IP, criar a conexão WebSocket
            socket = new WebSocket('ws://' + serverIP + ':5000');

            // Connection opened
            socket.addEventListener('open', function (event) {
                console.log('Connected to the WS Server!');
                resolve(socket); // Resolva a Promise com o objeto socket quando estiver conectado
            });

            // Connection closed
            socket.addEventListener('close', function (event) {
                console.log('Disconnected from the WS Server!')
            });

            // Tratamento de erros
            socket.addEventListener('error', function (event) {
                reject(event); // Rejeita a Promise em caso de erro na conexão
            });
        })
        .catch(error => {
            console.error('Erro ao obter endereço IP do servidor:', error);
            reject(error); // Rejeita a Promise em caso de erro na requisição
        });
});

export { socketPromise }; // Exporta a Promise ao invés do socket diretamente
