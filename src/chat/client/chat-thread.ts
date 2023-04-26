import { ChatRecord } from "./chat-record";

/** ChatThread: Record a conversation between human-AI. */
export class ChatThread {
    /** ID: The ID of the thread. */
    ID?: string;
    /** UserID: The User ID of the thread. */
    UserID?: string;
    /** Language: The language of the thread. */
    Language?: string;
    /** Records: The chat records of the thread. */
    Records: Record<string, ChatRecord> = {};
}