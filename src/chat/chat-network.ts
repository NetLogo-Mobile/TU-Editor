import { ChatThread } from "./client/chat-thread";
import { ChatRecord } from "./client/chat-record";
import { ChatResponseSection, ChatResponseType } from "./client/chat-response";
import { SSEClient } from "./sse-client";
import { ClientChatRequest } from "./client/chat-request";

/** ChatNetwork: Class that handles the network communication for the chat. */
export class ChatNetwork {
    /** SendRequest: Send a request to the chat backend and handle its outputs. */
    public static async SendRequest(Record: ChatRecord, Thread: ChatThread, 
        NewSection: (Section: ChatResponseSection) => void, 
        UpdateSection: (Section: ChatResponseSection) => void, 
        FinishSection: (Section: ChatResponseSection) => void): Promise<ChatRecord> {
        // Build the record
        Record.UserID = Thread.UserID;
        Record.ThreadID = Thread.ID;
        Record.Transparent = Record.Option?.Transparent ?? false;
        Record.Response = { Sections: [] };
        Record.RequestTimestamp = Date.now();
        console.log(Record);
        // Do the request
        return new Promise<ChatRecord>((Resolve, Reject) => {
            var Section: ChatResponseSection = { Content: "" };
            var Client = new SSEClient("http://localhost:3000/request", "", Record as ClientChatRequest);
            // Send the request
            Client.Listen((Data) => {
                try {
                    var Update = JSON.parse(Data.data) as ChatResponseSection;
                    // console.log(Update);
                } catch (Exception) {
                    console.log("Error: " + Data.data);
                    return;
                }
                // Handle the update
                switch (Update.Type) {
                    case ChatResponseType.ServerError:
                        Reject(Update.Content);
                        Client.Close();
                        return;
                    case ChatResponseType.Start:
                        if (Update.Content) {
                            Record.ID = Update.Content;
                            Record.ThreadID = Update.Optional;
                            Thread.ID = Update.Optional;
                        } else if (Update.Optional) {
                            Record.Language = Update.Optional;
                            Thread.Language = Update.Optional;
                        }
                        return;
                    case ChatResponseType.Finish:
                        if (Section.Type !== undefined) {
                            Record.Response.Sections.push(Section);
                            Thread.Records[Record.ID] = Record;
                            FinishSection(Section);
                        }
                        Record.ResponseTimestamp = Date.now();
                        Resolve(Record);
                        return;
                    case undefined:
                        break;
                    default:
                        if (Section.Type !== undefined) {
                            Record.Response.Sections.push(Section);
                            FinishSection(Section);
                        }
                        Section = Update;
                        Section.Options = Section.Options ?? [];
                        NewSection(Section);
                        return;
                }
                // Update the section
                Section.Content += Update.Content;
                if (Update.Optional !== undefined) 
                    Section.Optional = Update.Optional;
                if (Update.Summary !== undefined) 
                    Section.Summary = Update.Summary;
                if (Update.Options !== undefined) 
                    Section.Options!.push(...Update.Options);
                UpdateSection(Section);
            }, (Error) => {
                console.log("Server Error: " + Error);
                Reject(Error);
            });
        });
    }
}