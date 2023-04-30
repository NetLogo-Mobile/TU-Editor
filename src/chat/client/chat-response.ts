import { ChatResponseOption } from "./chat-option";

/** ChatResponse: A chat response. */
export interface ChatResponse {
    /** Sections: The sections of the response. */
    Sections: ChatResponseSection[];
    /** Options: The options for the section. */
    Options: ChatResponseOption[];
}

/** NewChatResponse: Creates a new chat response. */
export function NewChatResponse(): ChatResponse {
    return { Sections: [], Options: [] }
}

/** ChatResponseSection: A section in a chat response. */
export interface ChatResponseSection {
    /** Type: The type of the section. */
    Type?: ChatResponseType;
    /** Field: The JSON5 field of the section. */
    Field?: string;
    /** Content: The content of the section. */
    Content?: string;
    /** Summary: The summary of the section. */
    Summary?: string;
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
    /** JSON: The response is a JSON block. */
    JSON = 2,
    /** Thought: The response is a thought block. */
    Thought = 3,
    /** CompileError: The response is a compile error message. */
    CompileError = 4,
    /** RuntimeError: The response is a runtime error message. */
    RuntimeError = 5,
    /** ServerError: The response is a server error message. */
    ServerError = 6
}