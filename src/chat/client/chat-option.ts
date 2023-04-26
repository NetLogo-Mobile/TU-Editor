/** ChatResponseOption: An option for the chat response. */
export interface ChatResponseOption {
    /** Label: The label of the option. */
    Label: string;
    /** LocalizedLabel: The localized label of the option. */
    LocalizedLabel?: string;
    /** Style: The style of the option. */
    Style?: string;
    /** Operation: The operation to perform if the option is chosen. Default is Inherit. */
    Operation?: string;
    /** SubOperation: The sub-operation to perform if the option is chosen. Default is Inherit.*/
    SubOperation?: string;
    /** AskInput: Whether the user should be asked for input. Default is false. */
    AskInput?: boolean;
    /** CodeInContext: Whether the code should be retained in the context. Default is true. */
    CodeInContext?: boolean;
    /** Segment: How the text message should be retained in the following context. Default is EntireMessage. */
    MessageInContext?: ContextMessage,
    /** Inheritance: How to inherit the parent context if the option is chosen. Default is InheritEntire. */
    Inheritance?: ContextInheritance;
}

/** ContextMessage: How to segment a message for the context. */
export enum ContextMessage {
    /** Nothing: Nothing should be retained. */
    Nothing = 0,
    /** Section: Only the current section should be retained. */
    Section = 1,
    /** EntireMessage: The entire message should be retained. */
    EntireMessage = 2,
}

/** ContextInheritance: How to inherit the parent context. */
export enum ContextInheritance {
    /** Drop: Drop the context. */
    Drop = 0,
    /** InheritOne: Only inherit the current message segment. */
    InheritOne = 1,
    /** InheritParent: Only inherit the current message segment and its parent context. */
    InheritParent = 2,
    /** InheritRecursive: Inherit the current message segment and its parent context, recursively based on the parent's strategy. */
    InheritRecursive = 3,
    /** InheritEntire: Inherit the entire context. */
    InheritEntire = 4,
}