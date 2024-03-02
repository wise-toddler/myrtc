import { createWorker } from 'mediasoup';
import { createServer } from 'http';

const MEDIA_SERVER_PORT = 3000 // Change this port number if needed

// Create a plain HTTP server to listen for WebSocket connections
const httpServer = createServer()

// Create a mediasoup worker
const mediaServer = createWorker()

// Initialize the mediasoup worker
;(async () => {
    await mediaServer.initialize()

    // Create a router
    const router = await mediaServer.createRouter({
        mediaCodecs: [
            {
                kind: 'audio',
                mimeType: 'audio/opus',
                clockRate: 48000,
                channels: 2,
            },
            {
                kind: 'video',
                mimeType: 'video/VP8',
                clockRate: 90000,
                parameters: {
                    'x-google-start-bitrate': 1000,
                },
            },
        ],
    })

    // Create an HTTP/WebSocket transport to listen for client connections
    const mediaServerOptions = {
        // Configure mediaSoup to listen on the same port as the HTTP server
        // This enables the WebSocket server to accept WebSocket connections on the same port
        listenIps: [
            {
                ip: '0.0.0.0',
                announcedIp: process.env.MEDIASOUP_LISTEN_IP || '127.0.0.1',
            },
        ],
        // Other configuration options can be added here
    }
    const mediaServerWebSocket = await router.createWebRtcTransport(
        mediaServerOptions
    )

    // Listen for WebSocket connections on the specified port
    await httpServer.listen(MEDIA_SERVER_PORT, '0.0.0.0')

    console.log(`Media server is running on port ${MEDIA_SERVER_PORT}`)
})()

// Handle errors
mediaServer.on('died', () => {
    console.error('Mediasoup worker died')
    process.exit(1)
})

// Handle WebSocket connection errors
httpServer.on('error', (error) => {
    console.error('HTTP server error:', error)
})
