/** ChatResponseOption: An option for the chat response. */
export interface ChatResponseOption {
    /** Label: The label of the option. */
    Label: string;
    /** LocalizedLabel: The localized label of the option. */
    LocalizedLabel?: string;
    /** ActualInput: The underlying input of the option. */
    ActualInput?: string;
    /** Style: The style of the option. */
    Style?: string;
    /** Operation: The operation to perform if the option is chosen. Default is Inherit. */
    Operation?: string;
    /** SubOperation: The sub-operation to perform if the option is chosen. Default is Empty. */
    SubOperation?: string;
    /** AskInput: Whether the user should be asked for input. Default is false. */
    AskInput?: boolean;
    /** InputInContext: Whether the input should be retained in the context. Default is true. */
    InputInContext?: boolean;
    /** CodeInContext: Whether the code output should be retained in the context. Default is true. */
    CodeInContext?: boolean;
    /** TextInContext: How the the text output should be retained in the following context. Default is TextAndThoughts. */
    TextInContext?: ContextMessage,
    /** Transparent: Whether the resulting record should be transparent in the context. Children of transparent records will recognize grand-parents instead. */
    Transparent?: boolean;
    /** Inheritance: How to inherit the parent context if the option is chosen. Default is InheritEntire. */
    Inheritance?: ContextInheritance;
    /** Callback: The callback to perform if the option is chosen. Will discard the normal chat behavior. */
    Callback?: () => void;
}

/** ContextMessage: How to inherit an output message for the context. */
export enum ContextMessage {
    /** Nothing: Nothing should be retained. */
    Nothing = 0,
    /** TextOnly: Only text messages should be retained, in a text format. */
    MessagesAsText = 1,
    /** MessagesAsJSON: Only text messages should be retained, in a JSON format. */
    MessagesAsJSON = 2,
    /** FirstJSON: Only the first JSON message should be retained. */
    FirstJSON = 3,
    /** AllAsJSON: Except for the code, all should be retained in a JSON format. */
    AllAsJSON = 4,
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