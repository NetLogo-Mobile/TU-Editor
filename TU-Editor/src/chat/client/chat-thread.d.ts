import { ChatRecord } from "./chat-record";
/** ChatThread: Record a conversation between human-AI. */
export declare class ChatThread {
    /** ID: The ID of the thread. */
    ID?: string;
    /** UserID: The User ID of the thread. */
    UserID?: string;
    /** Language: The language of the thread. */
    Language?: string;
    /** Records: The chat records of the thread. */
    Records: Record<string, ChatRecord>;
    /** GetRecord: Get a record by its parent ID. */
    GetRecord(ParentID?: string): ChatRecord | undefined;
    /** Subthreads: The subthreads of the conversation. */
    Subthreads: ChatSubthread[];
    /** GetSubthread: Get a specific subthread. */
    GetSubthread(RootID: string): ChatSubthread | undefined;
    /** AddToSubthread: Add a record to a subthread. */
    AddToSubthread(Record: ChatRecord): ChatSubthread;
}
/** ChatSubthread: Record a context of a conversation between human-AI. */
export interface ChatSubthread {
    /** RootID: The root parent ID of the subthread. */
    RootID: string;
    /** Records: The chat records of the subthread. */
    Records: ChatRecord[];
}
