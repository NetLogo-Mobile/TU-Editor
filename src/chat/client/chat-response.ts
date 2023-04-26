import { ChatResponseOption } from "./chat-option";

/** ChatResponse: A chat response. */
export interface ChatResponse {
    /** Sections: The sections of the response. */
    Sections: ChatResponseSection[];
}

/** NewChatResponse: Creates a new chat response. */
export function NewChatResponse(): ChatResponse {
    return { Sections: [] }
}

/** ChatResponseSection: A section in a chat response. */
export interface ChatResponseSection {
    /** Type: The type of the section. */
    Type?: ChatResponseType;
    /** Index: The index of the section. */
    Index?: number;
    /** Content: The content of the section. */
    Content: string;
    /** Summary: The summary of the section. */
    Summary?: string;
    /** Optional: The optional content of the section. */
    Optional?: string;
    /** Options: The options for the section. */
    Options?: ChatResponseOption[];
}

/** ChatResponseType: The type for the chat response. */
export enum ChatResponseType {
    /** Start: The response is a start message. */
    Start = -1,
    /** Finish: The response is a finish message. */
    Finish = -2,
    /** Text: The response is a text block. */
    Text = 0,
    /** Code: The response is a code block. */
    Code = 1,
    /** CompileError: The response is a compile error message. */
    CompileError = 2,
    /** RuntimeError: The response is a runtime error message. */
    RuntimeError = 3,
    /** ServerError: The response is a server error message. */
    ServerError = 4
}