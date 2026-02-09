import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

console.log("be running");

wss.on("connection", (ws) => {
    console.log("socket connected")
    ws.on("message", (data: any) => {
        const message = JSON.parse(data);

        if (message.type === "sender") {
            senderSocket = ws;
            console.log("sender set");
        }
        else if (message.type === "receiver") {
            receiverSocket = ws;
            console.log("receiver set");
        }
        else if (message.type === "create-offer") {
            console.log("create offer triggered");
            receiverSocket?.send(JSON.stringify({
                type: "create-offer",
                sdp: message.sdp
            }))
        }
        else if (message.type === "create-answer") {
            console.log("create answer triggered");
            senderSocket?.send(JSON.stringify({
                type: "create-answer",
                sdp: message.sdp
            }))
        }
        else if (message.type === "ice-candidate") {
            if (ws === senderSocket) {
                console.log("sender ice candidate");
                
                receiverSocket?.send(JSON.stringify({ type: 'ice-candidate', candidate: message.candidate }))
            }
            else if (ws === receiverSocket) {
                console.log("receiver ice candidate");
                senderSocket?.send(JSON.stringify({ type: "ice-candidate", candidate: message.candidate }))
            }
        }
    })
})
