/** StreamData: Define the StreamData interface to describe the structure of data received from the SSE stream **/
export interface StreamData {
    id: string;
    event: string;
    data: string;
}

/** SSEClient: A simple client for handling Server-Sent Events. */
export class SSEClient {
    /** Request: The XMLHttpRequest instance. */
    public readonly Request: XMLHttpRequest;
    
    /** url: The url to connect to. */
    private url: string;
    /** authorization: The authorization token to use when connecting to the SSE stream. */
    private authorization: string;
    /** lastEventId: The last event ID received from the SSE stream. */
    private lastEventId: string;
    /** payload: The payload to send to the SSE stream. */
    private payload: any;

    /** Constructor: Create a new SSEClient instance. */
    constructor(url: string, authorization: string, payload: any) {
        this.url = url;
        this.authorization = authorization;
        this.lastEventId = '';
        this.payload = JSON.stringify(payload);
        this.Request = new XMLHttpRequest();
    }

    /**
     * Listen: Start listening to the SSE stream
     * @param {Function} onMessage Callback function for handling the received message
     */
    public Listen(onMessage: (data: StreamData) => void, onError: (this: XMLHttpRequest, ev: ProgressEvent) => void): void {
        this.Request.open('POST', this.url, true);
        this.Request.setRequestHeader('Cache-Control', 'no-cache');
        this.Request.setRequestHeader('Content-Type', 'application/json');
        this.Request.setRequestHeader('Authorization', `Bearer ${this.authorization}`);
        this.Request.setRequestHeader('Accept', 'text/event-stream');

        // If we have a last event ID, set the header to resume from that point
        if (this.lastEventId) {
            this.Request.setRequestHeader('Last-Event-ID', this.lastEventId);
        }

        // Handle the received message
        var responseCursor = 0;
        this.Request.onreadystatechange = () => {
            if (this.Request.status === 200) {
                const messages = this.Request.responseText.substring(responseCursor).trim().split('\n\n');
                responseCursor = this.Request.responseText.length;
                messages.forEach((message) => {
                    const data = this.parseMessage(message);
                    if (data) {
                        this.lastEventId = data.id;
                        onMessage(data);
                    }
                });
            } else {
                onError.call(this.Request, null);
            }
        };

        // Handle errors
        this.Request.onerror = onError;
        this.Request.send(this.payload);
    }

    /** Close: Stop listening to the SSE stream. */
    public Close(): void {
        if (this.Request) {
            this.Request.abort();
        }
    }

    /**
     * parseMessage: Parse the received message from the SSE stream
     * @param {string} message The raw message received from the SSE stream
     * @returns {StreamData | null} The parsed message as a StreamData object or null if the message is empty
     */
    private parseMessage(message: string): StreamData | null {
        if (!message) return null;

        const lines = message.split('\n');
        const data: StreamData = {
            id: '',
            event: '',
            data: '',
        };

        lines.forEach((line) => {
            const index = line.indexOf(':');
            var key = line.substring(0, index).trim();
            var value = line.substring(index + 1).trim();
            switch (key) {
                case 'id':
                    data.id = value;
                    break;
                case 'event':
                    data.event = value;
                    break;
                case 'data':
                    data.data = value;
                    break;
            }
        });

        return data;
    }
}
