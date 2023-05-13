import { ChatThread } from "./client/chat-thread";
import { ChatRecord } from "./client/chat-record";
import { ChatResponseSection } from "./client/chat-response";
/** ChatNetwork: Class that handles the network communication for the chat. */
export declare class ChatNetwork {
    /** Domain: The domain of the chat backend. */
    static Domain: string;
    /** SendRequest: Send a request to the chat backend and handle its outputs. */
    static SendRequest(Record: ChatRecord, Thread: ChatThread, NewSection: (Section: ChatResponseSection) => void, UpdateSection: (Section: ChatResponseSection) => void, FinishSection: (Section: ChatResponseSection) => void): Promise<ChatRecord>;
    /** TryParse: Try to parse a JSON5 string. */
    private static TryParse;
}
