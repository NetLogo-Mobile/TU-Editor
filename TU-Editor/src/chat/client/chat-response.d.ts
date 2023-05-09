import { ChatResponseOption } from './chat-option';
/** ChatResponse: A chat response. */
export interface ChatResponse {
    /** Sections: The sections of the response. */
    Sections: ChatResponseSection[];
    /** Options: The options for the section. */
    Options: ChatResponseOption[];
}
/** NewChatResponse: Creates a new chat response. */
export declare function NewChatResponse(): ChatResponse;
/** ChatResponseSection: A section in a chat response. */
export interface ChatResponseSection {
    /** Type: The type of the section. */
    Type?: ChatResponseType;
    /** Field: The JSON5 field of the section. */
    Field?: string;
    /** Content: The content of the section. */
    Content?: string;
    /** Edited: The edited content of the section. */
    Edited?: string;
    /** Options: The options for the section. */
    Options?: ChatResponseOption[];
    /** Parsed: The parsed content of the section. */
    Parsed?: any;
}
/** ChatResponseType: The type for the chat response. */
export declare enum ChatResponseType {
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
/** GetField: Returns the section with the given field. */
export declare function GetField(Sections: ChatResponseSection[], Field: string): ChatResponseSection | undefined;
/** IsTextLike: Returns true if the section is text-like. */
export declare function IsTextLike(Section: ChatResponseSection): boolean;
/** ExcludeCode: Returns true if the section is not code-like. */
export declare function ExcludeCode(Section: ChatResponseSection): boolean;
/** SectionsToJSON: Serialize a number of sections to JSON5. */
export declare function SectionsToJSON(Sections: ChatResponseSection[]): string;
