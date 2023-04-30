import { ChatResponseOption } from './chat-option';

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

/** IsTextLike: Returns true if the section is text-like. */
export function IsTextLike(Section: ChatResponseSection): boolean {
    return Section.Type == ChatResponseType.Text || Section.Type == ChatResponseType.CompileError || Section.Type == ChatResponseType.RuntimeError;
}

/** ExcludeCode: Returns true if the section is not code-like. */
export function ExcludeCode(Section: ChatResponseSection): boolean {
    return Section.Type != ChatResponseType.Code && Section.Type != ChatResponseType.RuntimeError;
}

/** SectionsToJSON: Serialize a number of sections to JSON5. */
export function SectionsToJSON(Sections: ChatResponseSection[]): string {
    var Result = "{";
    for (var Section of Sections) {
        Result += `${Section.Field ?? ChatResponseType[Section.Type!]}: ${Section.Type == ChatResponseType.JSON ? Section.Content : JSON.stringify(Section.Content)}`;
        if (Section != Sections[Sections.length - 1]) Result += ",\n";
    }
    return Result + "}";
}