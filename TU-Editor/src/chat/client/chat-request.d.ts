import { ChatContext } from "./chat-context";
import { ChatResponseOption } from "./chat-option";
/** ChatRequest: A chat request. */
export interface ChatRequest {
    /** Input: The requested message. */
    Input: string;
    /** Option: The option chosen. */
    Option?: ChatResponseOption;
    /** Operation: The requested operation. */
    Operation?: string;
    /** SubOperation: The requested sub-operation. */
    SubOperation?: string;
    /** Context: The context of the request. */
    Context?: ChatContext;
    /** Language: The language of the request. */
    Language?: string;
}
/** ClientChatRequest: A chat request from the client. */
export interface ClientChatRequest extends ChatRequest {
    /** UserID: The related User ID. */
    UserID?: string;
    /** ThreadID: The related thread ID. */
    ThreadID?: string;
    /** ParentID: The parent response ID. */
    ParentID?: string;
    /** FriendlyInput: The input for display. */
    FriendlyInput?: string;
}
