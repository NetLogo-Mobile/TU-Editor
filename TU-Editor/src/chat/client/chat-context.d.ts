/** ChatContext: The context for a chat request. */
export interface ChatContext {
    /** ParentID: The id of the parent record. */
    ParentID?: string;
    /** ParentIndex: The section index of the parent record. */
    ParentIndex?: number;
    /** ProjectName: The name of the project. */
    ProjectName?: string;
    /** ProjectContext: The context of the project. */
    ProjectContext?: LanguageContext;
    /** CodeSnippet: The code snippet in the context. */
    CodeSnippet?: string;
    /** PreviousMessages: The previous messages in the context. */
    PreviousMessages: ChatMessage[];
}
/** LanguageContext: The context for a language request. */
export interface LanguageContext {
    /** Language: The language of the project. */
    Language: string;
}
/** ChatMessage: A previous message in a chat context. */
export interface ChatMessage {
    /** Text: The message. */
    Text: string;
    /** Role: The role of the speaker. */
    Role: ChatRole;
}
/** ChatRole: The role of the speaker. */
export declare enum ChatRole {
    /** System: The system. */
    System = "system",
    /** User: The user. */
    User = "user",
    /** Assistant: The assistant. */
    Assistant = "assistant"
}
