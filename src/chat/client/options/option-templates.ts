import { ChatResponseOption, ContextInheritance, ContextMessage } from "../chat-option";
import { DiagnosticType } from "../languages/netlogo-context";

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

/** NewTopic: Generate a template new topic option. */
export function NewTopic(Input: string, Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Let's start a new thread for this",
        ActualInput: Input,
        Operation: "Generic",
        Style: "leave",
        AskInput: false,
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

/** Clarify: Generate a template clarification option. */
export function Clarify(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Let me clarify it",
        Style: Label == undefined ? "followup" : undefined,
        AskInput: Label == undefined,
        SubOperation: "Clarify",
        TextInContext: ContextMessage.MessagesAsText,
        Inheritance: ContextInheritance.InheritRecursive
    }
}

/** AskFurther: Generate a template ask further option. */
export function AskFurther(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Actually, I mean...",
        Style: "followup",
        AskInput: true,
        Inheritance: ContextInheritance.InheritRecursive,
        Transparent: true
    }
}

/** EditCode: Generate a template edit code option. */
export function EditCode(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Can you edit the code?",
        Style: "followup",
        Operation: "EditCode",
        AskInput: true,
        TextInContext: ContextMessage.Nothing,
        Inheritance: ContextInheritance.InheritOne
    }
}

/** ExampleCode: Ask for an example code. */
export function ExampleCode(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Can you show me an example code?",
        Style: "followup",
        Operation: "CodeCompose",
        AskInput: false,
        Inheritance: ContextInheritance.InheritParent,
        TextInContext: ContextMessage.MessagesAsText
    }
}

/** AskCode: Ask a question about the code. */
export function AskCode(Label?: string, Style?: string): ChatResponseOption {
    return {
        Label: Label ?? "Can I ask a question?",
        Style: Style ?? "followup",
        Operation: "CodeAsk",
        AskInput: true,
        TextInContext: ContextMessage.Nothing,
        CodeInContext: true,
        Transparent: true,
        Inheritance: ContextInheritance.InheritOne
    }
}

/** FixCode: Fix the current code snippet. */
export function FixCode(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Help me fix this code",
        Operation: "CodeFix",
        AskInput: true,
        InputInContext: false,
        TextInContext: ContextMessage.Nothing,
        CodeInContext: true,
        Transparent: true,
        Inheritance: ContextInheritance.InheritOne
    }
}

/** ExplainErrors: Explain the errors. */
export function ExplainErrors(Type: DiagnosticType, Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Explain the error",
        Operation: "CodeExplain",
        SubOperation: Type,
        AskInput: true,
        InputInContext: false,
        TextInContext: ContextMessage.Nothing,
        CodeInContext: true,
        Inheritance: ContextInheritance.InheritOne
    }
}