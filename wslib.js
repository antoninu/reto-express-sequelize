const WebSocket = require("ws");

const clients = [];
const messages = [];

const wsConnection = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("connection");
    clients.push(ws);
    sendMessages();

    ws.on("message", (message) => {
      console.log("message");
      messages.push(message);
      sendMessages();
    });
  });

  const sendMessages = () => {
    console.log("send menssages");
    clients.forEach((client) => client.send(JSON.stringify(messages)));
  };

  return wss;
};

exports.wsConnection = wsConnection;
