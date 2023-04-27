import { ChatResponseOption, ContextInheritance, ContextMessage } from "../chat-option";

/** ChangeTopic: Generate a template change topic option. */
export function ChangeTopic(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Let's change a topic",
        Operation: "Generic",
        Style: "leave",
        AskInput: true,
        InputInContext: false,
        CodeInContext: false,
        TextInContext: ContextMessage.Nothing,
        Inheritance: ContextInheritance.Drop
    }
}

/** FollowUp: Generate a template follow-up option. */
export function FollowUp(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Actually, I mean...",
        Style: "followup",
        AskInput: true,
        Inheritance: ContextInheritance.InheritRecursive
    }
}

/** EditCode: Generate a template edit code option. */
export function EditCode(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Can you edit the code?",
        Style: "followup",
        Operation: "EditCode",
        AskInput: true,
        TextInContext: ContextMessage.Section,
        Inheritance: ContextInheritance.InheritOne
    }
}

/** AskExamples: Ask for examples. */
export function AskExamples(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Can you give me some examples?",
        Style: "followup",
        SubOperation: "Examples",
        AskInput: false,
        Transparent: true,
        Inheritance: ContextInheritance.InheritOne
    }
}

/** AskOtherExamples: Ask for other examples. */
export function AskOtherExamples(Label?: string): ChatResponseOption {
    var Option = AskExamples(Label ?? "Can you give me some other examples?");
    Option.Style = "followup-more";
    return Option;
}