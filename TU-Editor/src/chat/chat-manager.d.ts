import { CommandTab } from "../command/command-tab";
import { OutputDisplay } from "../command/displays/outputs";
import { ClientChatRequest } from "./client/chat-request";
import { ChatThread } from "./client/chat-thread";
import { ChatResponseOption } from "./client/chat-option";
import { ChatRecord } from "./client/chat-record";
/** ChatManager: The interface for connecting to a chat backend. */
export declare class ChatManager {
    /** Thread: The current chat thread. */
    Thread: ChatThread;
    /** PendingRequest: The pending chat request. */
    private PendingRequest;
    /** Reset: Reset the chat interface. */
    Reset(): void;
    /** SendMessage: Send a direct message to the chat backend. */
    SendMessage(Content: string, Friendly?: string): void;
    /** IsRequesting: Whether we are currently requesting anything. */
    static IsRequesting: boolean;
    /** SendRequest: Send a request to the chat backend and handle its outputs. */
    private SendRequest;
    /** GetPendingParent: Get the pending parent record. */
    GetPendingParent(): ChatRecord | undefined;
    /** RequestOption: Choose a chat option and send the request. */
    RequestOption(Option: ChatResponseOption, Record: ChatRecord, Postprocessor?: (Request: ClientChatRequest) => void): void;
    /** InheritContext: Inherit the context from the previous request. */
    private InheritContext;
    /** Tab: The command tab. */
    Commands: CommandTab;
    /** Outputs: The outputs area. */
    Outputs: OutputDisplay;
    /** Available: Whether the chat backend is available. */
    Available: boolean;
    /** ThinkProcess: Whether to demonstrate the thinking processes. */
    static ThinkProcess: boolean;
    /** Instance: The chat manager instance. */
    static Instance: ChatManager;
    /** Constructor: Create a chat interface. */
    constructor(Tab: CommandTab);
}
