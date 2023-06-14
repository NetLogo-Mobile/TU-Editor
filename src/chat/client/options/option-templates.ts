import { ChatResponseOption, ContextInheritance } from "../chat-option";
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
        TextInContext: false,
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
        TextInContext: false,
        Inheritance: ContextInheritance.Drop
    }
}

/** FollowUp: Generate a template follow-up option. */
export function FollowUp(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Can I ask a followup question?",
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
        TextInContext: false,
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
        TextInContext: false,
        Inheritance: ContextInheritance.CurrentOnly
    }
}

/** ExampleCode: Ask for an example code. */
export function ExampleCode(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Can you show me an example code?",
        Style: "code",
        Operation: "CodeCompose",
        AskInput: false,
        Inheritance: ContextInheritance.InheritParent,
        TextInContext: true
    }
}

/** AskCode: Ask a question about the code. */
export function AskCode(Label?: string, Style?: string, CodeOnly?: boolean): ChatResponseOption {
    return {
        Label: Label ?? "Can I ask a question?",
        Style: Style ?? "followup",
        Operation: "CodeAsk",
        AskInput: true,
        InputInContext: !(CodeOnly ?? false),
        TextInContext: !(CodeOnly ?? false),
        CodeInContext: true,
        Inheritance: ContextInheritance.CurrentOnly
    }
}

/** FixCode: Fix the current code snippet. */
export function FixCode(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Can you try to fix the code?",
        Style: "code",
        Operation: "CodeFix",
        AskInput: true,
        InputInContext: false,
        TextInContext: true,
        CodeInContext: true,
        Transparent: true,
        Inheritance: ContextInheritance.CurrentOnly
    }
}

/** ExplainErrors: Explain the code. */
export function ExplainCode(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Can you explain the code?",
        Operation: "CodeExplain",
        SubOperation: "Explain",
        AskInput: false,
        InputInContext: false,
        TextInContext: false,
        CodeInContext: true,
        Inheritance: ContextInheritance.CurrentOnly
    }
}

/** ExplainErrors: Explain the errors. */
export function ExplainErrors(Type: DiagnosticType, Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Can you explain the error?",
        Operation: "CodeExplain",
        SubOperation: Type,
        AskInput: true,
        InputInContext: false,
        TextInContext: false,
        CodeInContext: true,
        Inheritance: ContextInheritance.CurrentOnly
    }
}