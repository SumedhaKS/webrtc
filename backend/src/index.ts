import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on("connection", (ws) => {
    ws.on("message", (data: any) => {
        const message = JSON.parse(data);

        if (message.type === "sender") {
            senderSocket = ws;
        }
        else if (message.type === "receiver") {
            receiverSocket = ws;
        }
        else if (message.type === "create-offer") {
            receiverSocket?.send(JSON.stringify({
                type: "offer",
                offer: message.offer
            }))
        }
        else if (message.type === "create-answer") {
            senderSocket?.send(JSON.stringify({
                type: "offer",
                offer: message.offer
            }))
        }
    })
})
