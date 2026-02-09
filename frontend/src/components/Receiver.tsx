import { useEffect, useState } from "react"

export default function Receiver() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    // const [pc, setPC] = useState<RTCPeerConnection | null>(null);

    useEffect(() => {
        const socket: WebSocket = new WebSocket("ws://localhost:8080");
        setSocket(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "receiver" }));
        }

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            let pc: RTCPeerConnection | null = null;

            if (message.type === "create-offer") {
                pc = new RTCPeerConnection();
                console.log("PC: " + pc);
                pc.setRemoteDescription(message.sdp);

                pc.onicecandidate = (event) => {
                    console.log(event);
                    if (event.candidate) {
                        socket.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate }))
                    }
                }

                pc.ontrack = (track)=>{
                    console.log(track);
                }

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socket.send(JSON.stringify({ type: "create-answer", sdp: pc.localDescription }))
                console.log("after create-answer");
            }

            else if (message.type === "ice-candidate") {
                // @ts-ignore
                pc.addIceCandidate(message.candidate)
            }
        }

    }, [])

    return (
        <div>
            Receiver
        </div>
    )
}