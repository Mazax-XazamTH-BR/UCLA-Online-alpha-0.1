const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8081 });

let clients = []; // Array para armazenar os clientes conectados
let clientIdCounter = 1; // Contador para gerar identificadores únicos para os clientes

wss.on('listening', () => {
    console.log('Servidor WebSocket está ouvindo na porta 8081');
});

wss.on('connection', ws => {
    const clientId = clientIdCounter++; // Atribui um identificador único ao novo cliente
    const clientIp = ws._socket.remoteAddress; // Captura o endereço IP do cliente
    console.log(`Novo cliente conectado: Cliente ${clientId} com IP ${clientIp}`);
    
    // Adiciona o cliente ao array de clientes conectados
    clients.push({ id: clientId, ws });

    ws.on("close", () => {
        console.log("Cliente desconectado.");
        // Remove o cliente do array de clientes conectados ao desconectar
        clients = clients.filter(client => client !== ws);
    });
    ws.on("error", error => {
        console.error('Erro no cliente:', error);
    });
    // Esta parte específica abaixo agora retransmite a mensagem para os outros clientes conectados
    ws.on('message', message => {
        console.log(`Mensagem recebida do Cliente ${clientId}: ${message}`);
        try {
            let parsedMessage = JSON.parse(message);

            // Envia a mensagem recebida para todos os outros clientes conectados
            clients.forEach(client => {
                if (client.ws !== ws && client.ws.readyState === WebSocket.OPEN) {
                    client.ws.send(JSON.stringify(parsedMessage));
                }
            });
        } catch (error) {
            console.error('Erro ao processar mensagem JSON:', error);
        }
    });
});

wss.on('error', error => {
    console.error('Erro no servidor WebSocket:', error);
});



console.log('Servidor WebSocket está rodando na porta 8081');
