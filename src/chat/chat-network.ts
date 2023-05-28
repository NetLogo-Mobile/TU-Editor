import { ChatThread } from "./client/chat-thread";
import { ChatRecord } from "./client/chat-record";
import { ChatResponseSection, ChatResponseType } from "./client/chat-response";
import { SSEClient } from "./sse-client";
import { ClientChatRequest } from "./client/chat-request";
import { ChatResponse } from '../../dist/TU-Editor/src/chat/client/chat-response';
declare const { JSON5 }: any;

/** ChatNetwork: Class that handles the network communication for the chat. */
export class ChatNetwork {
    /** Domain: The domain of the chat backend. */
    public static Domain: string = "";
    /** SendRequest: Send a request to the chat backend and handle its outputs. */
    public static async SendRequest(Record: ChatRecord, Thread: ChatThread, 
        NewSection: (Section: ChatResponseSection) => void, 
        UpdateSection: (Section: ChatResponseSection) => void, 
        FinishSection: (Section: ChatResponseSection) => void): Promise<ChatRecord> {
        // Build the record
        Record.UserID = Thread.UserID;
        Record.ThreadID = Thread.ID;
        Record.Transparent = Record.Option?.Transparent ?? false;
        Record.Response = { Sections: [], Options: [] };
        Record.RequestTimestamp = Date.now();
        // Do the request
        return new Promise<ChatRecord>((Resolve, Reject) => {
            var Update: ChatResponseSection = { };
            var Section: ChatResponseSection = { };
            var Client = new SSEClient(`${ChatNetwork.Domain}request`, "", Record as ClientChatRequest);
            // Finish the section if possible
            var TryFinishSection = () => {
                if (Section.Type !== undefined) {
                    if (Section.Type === ChatResponseType.JSON && Section.Content && !Section.Parsed) {
                        if (Section.Content.endsWith(","))
                            Section.Content = `[${Section.Content.substring(0, Section.Content.length - 1)}]`;
                        Section.Parsed = ChatNetwork.TryParse(Section.Content);
                    } 
                    Record.Response.Sections.push(Section);
                    FinishSection(Section);
                }
            };
            // Parse an element in the array if possible
            var TryParseElement = () => {
                if (Section.Type === ChatResponseType.JSON && Update.Content && Update.Content.endsWith("},")) {
                    Section.Parsed = Section.Parsed ?? [];
                    Section.Parsed.push(ChatNetwork.TryParse(Update.Content.substring(0, Update.Content.length - 1)));
                }
            };
            // Try to parse an update
            var TryParseUpdate = () => {
                switch (Update.Type) {
                    case ChatResponseType.Start:
                        if (Update.Edited && Update.Content) {
                            Record.ID = Update.Content;
                            Record.ThreadID = Update.Edited;
                            Thread.ID = Update.Edited;
                        } else {
                            switch (Update.Field) {
                                case "Language":
                                    Record.Language = Update.Content;
                                    Thread.Language = Update.Content;
                                    break;
                                case "Transparent":
                                    Record.Transparent = Update.Content === "true";
                                    break;
                            }
                        }
                        return;
                    case ChatResponseType.Finish:
                        TryFinishSection();
                        Record.ResponseTimestamp = Date.now();
                        Thread.Records[Record.ID] = Record;
                        Resolve(Record);
                        return;
                    case undefined:
                        break;
                    default:
                        TryFinishSection();
                        Section = Update;
                        TryParseElement();
                        NewSection(Section);
                        // Irrecoverable error completes the section
                        if (Section.Type === ChatResponseType.ServerError && Section.Field == "Irrecoverable") {
                            Record.ResponseTimestamp = Date.now();
                            Thread.Records[Record.ID] = Record;
                            Resolve(Record);
                        }
                        return;
                }
                // Update the section
                if (Update.Content !== undefined)
                    Section.Content += Update.Content;
                if (Update.Field !== undefined) 
                    Section.Field = Update.Field;
                if (Update.Options !== undefined)
                    Record.Response.Options!.push(...Update.Options);
                TryParseElement();
                UpdateSection(Section);
            }
            // Send the request
            Client.Listen((Data) => {
                var Raw: any | any[];
                // Pause the update
                try {
                    Raw = JSON.parse(Data.data);
                } catch (Exception) {
                    console.log("Error: " + Data.data);
                    return;
                }
                // Handle the update
                if (Array.isArray(Raw)) {
                    Raw.forEach(Current => {
                        Update = Current;
                        TryParseUpdate();
                    });
                } else {
                    Update = Raw;
                    TryParseUpdate();
                }
            }, (Error) => {
                console.log("Server Error: " + Error);
                Reject(Error);
            });
        });
    }
    /** TryParse: Try to parse a JSON5 string. */
    private static TryParse(Source: string): any {
        try {
            return JSON5.parse(Source);
        } catch (Exception) {
            console.log(Source);
            console.log(Exception);
            return {};
        }
    }
}