/** StreamData: Define the StreamData interface to describe the structure of data received from the SSE stream **/
export interface StreamData {
    id: string;
    event: string;
    data: string;
}
/** SSEClient: A simple client for handling Server-Sent Events. */
export declare class SSEClient {
    /** Request: The XMLHttpRequest instance. */
    readonly Request: XMLHttpRequest;
    /** url: The url to connect to. */
    private url;
    /** authorization: The authorization token to use when connecting to the SSE stream. */
    private authorization;
    /** lastEventId: The last event ID received from the SSE stream. */
    private lastEventId;
    /** payload: The payload to send to the SSE stream. */
    private payload;
    /** Constructor: Create a new SSEClient instance. */
    constructor(url: string, authorization: string, payload: any);
    /**
     * Listen: Start listening to the SSE stream
     * @param {Function} onMessage Callback function for handling the received message
     */
    Listen(onMessage: (data: StreamData) => void, onError: (this: XMLHttpRequest, ev?: ProgressEvent) => void): void;
    /** Close: Stop listening to the SSE stream. */
    Close(): void;
    /**
     * parseMessage: Parse the received message from the SSE stream
     * @param {string} message The raw message received from the SSE stream
     * @returns {StreamData | null} The parsed message as a StreamData object or null if the message is empty
     */
    private parseMessage;
}
