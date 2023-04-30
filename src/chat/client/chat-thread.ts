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
    /** GetRecord: Get a record by its parent ID. */
    public GetRecord(ParentID?: string): ChatRecord | undefined {
        if (!ParentID) return undefined;
        return this.Records[ParentID];
    }
    /** Subthreads: The subthreads of the conversation. */
    Subthreads: ChatSubthread[] = [];
    /** GetSubthread: Get a specific subthread. */
    public GetSubthread(RootID: string): ChatSubthread | undefined {
        return this.Subthreads.find((Subthread) => Subthread.RootID === RootID);
    }
    /** AddToSubthread: Add a record to a subthread. */
    public AddToSubthread(Record: ChatRecord): ChatSubthread {
        // Find the parent
        var Parent = Record;
        while (Parent.ParentID) {
            Parent = this.Records[Parent.ParentID];
        }
        // Find or create a subthread
        var Subthread = this.Subthreads.find((Subthread) => 
            (Subthread.RootID === Parent.ID && Subthread.RootID !== undefined) || Subthread.Records[0] === Parent);
        if (!Subthread) {
            Subthread = { RootID: Parent.ID, Records: [] };
            this.Subthreads.push(Subthread);
        }
        // Add the record
        Subthread.Records.push(Record);
        return Subthread;
    }
}

/** ChatSubthread: Record a context of a conversation between human-AI. */
export interface ChatSubthread {
    /** RootID: The root parent ID of the subthread. */
    RootID: string;
    /** Records: The chat records of the subthread. */
    Records: ChatRecord[];
}