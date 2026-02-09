import { useEffect, useState } from "react"

export default function Sender() {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket: WebSocket = new WebSocket("ws://localhost:8080");
        setSocket(socket)
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'sender' }));
        }

    }, [])

    const startSendingVideo = async () => {
        console.log("button clicked");
        if (!socket) return;

        const pc = new RTCPeerConnection();

        pc.onnegotiationneeded = async () => {
            console.log("on negotiaion needed trigerred");
            
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket?.send(JSON.stringify({ type: "create-offer", sdp: pc.localDescription }))
        }

        pc.onicecandidate = (event) => {
            console.log(event);
            if (event.candidate) {
                socket.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }))
            }
        }

        socket.onmessage = async (event) => {
             const data = JSON.parse(event.data);
            if (data.type === "create-answer") {
                await pc.setRemoteDescription(data.sdp);
                console.log("RD set");
            }

            else if (data.type === "ice-candidate") {
                pc.addIceCandidate(data.candidate);
            }
        }

        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
        pc.addTrack(stream.getVideoTracks()[0]);
    }

    return (
        <div>
            Sender

            <button onClick={startSendingVideo}>Send Video</button>
        </div>
    )
}