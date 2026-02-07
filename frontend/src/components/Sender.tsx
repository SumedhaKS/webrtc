import { useEffect, useState } from "react"

export default function Sender() {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket: WebSocket = new WebSocket("ws://localhost:8080");
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'sender' }));
        }

    }, [])

    const startSendingVideo = async () => {
        if (!socket) return;
        const pc = new RTCPeerConnection();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket?.send(JSON.stringify({ type: "create-offer", sdp: pc.localDescription }))

        socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if(data.type === "create-answer"){
                await pc.setRemoteDescription(data.sdp); 
            }
        }
    }

    return (
        <div>
            Sender

            <button onClick={startSendingVideo}>Send Video</button>
        </div>
    )
}