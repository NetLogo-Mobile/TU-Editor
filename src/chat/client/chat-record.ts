import { ClientChatRequest } from "./chat-request";
import { ChatResponse } from "./chat-response";

/** ChatRecord: A client-side record of a chat exchange. */
export interface ChatRecord extends ClientChatRequest {
    /** ID: The id of the record. */
    ID: string;
    /** Response: The response to the request. */
    Response: ChatResponse;
    /** Transparent: Whether the record is transparent and should be skipped in the inheritance chain. */
    Transparent: boolean;
    /** RequestTimestamp: The timestamp of the request. */
    RequestTimestamp: number;
    /** ResponseTimestamp: The timestamp of the response. */
    ResponseTimestamp: number;
}