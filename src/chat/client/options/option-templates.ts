import { ChatResponseOption, ContextInheritance, ContextMessage } from "../chat-option";

/** ChangeTopic: Generate a template change topic option. */
export function ChangeTopic(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Let's change a topic",
        Operation: "Generic",
        Style: "ChangeTopic",
        AskInput: true,
        CodeInContext: false,
        MessageInContext: ContextMessage.Nothing,
        Inheritance: ContextInheritance.Drop
    }
}

/** FollowUp: Generate a template follow-up option. */
export function FollowUp(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Actually, I mean...",
        Style: "FollowUp",
        AskInput: true,
        CodeInContext: true,
        MessageInContext: ContextMessage.EntireMessage,
        Inheritance: ContextInheritance.InheritRecursive
    }
}

/** AskExamples: Ask for examples. */
export function AskExamples(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Can you give me some examples?",
        Style: "AskExamples",
        AskInput: false,
        CodeInContext: true,
        MessageInContext: ContextMessage.Section,
        Inheritance: ContextInheritance.InheritParent
    }
}

/** AskOtherExamples: Ask for other examples. */
export function AskOtherExamples(Label?: string): ChatResponseOption {
    return AskExamples(Label ?? "Can you give me other examples?");
}