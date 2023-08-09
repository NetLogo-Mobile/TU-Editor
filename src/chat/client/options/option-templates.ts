import { ChatResponseOption, ContextInheritance } from "../chat-option";
import { DiagnosticType } from "../languages/netlogo-context";

/** ChangeTopic: Generate a template change topic option. */
export function ChangeTopic(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Let's change the topic",
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
export function FollowUp(Operation?: string, Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Can I ask a followup question?",
        Style: "followup",
        Operation: Operation,
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
        TextInContext: true,
        Inheritance: ContextInheritance.InheritRecursive
    }
}

/** ExampleCode: Ask for an example code. */
export function ExampleCode(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Can you show me an example code?",
        Style: "code",
        Operation: "CodeCompose",
        SubOperation: "Example",
        AskInput: false,
        Inheritance: ContextInheritance.InheritParent,
        TextInContext: true,
        InputInContext: false
    }
}

/** WriteCodeWithPlan: Write a code snippet based on the plan. */
export function WriteCodeWithPlan(AskMore: boolean): ChatResponseOption {
    return {
        Label: AskMore ? "I think something could be added to the plan." : "Let's try out the plan!",
        ActualInput: AskMore ? undefined : "",
        Style: "code",
        Operation: "CodeCompose",
        SubOperation: "Planned",
        AskInput: AskMore,
        Inheritance: ContextInheritance.InheritRecursive,
        TextInContext: true,
        InputInContext: true
    }
}

/** EnterCode: Enter the code editor. */
export function EnterCode(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Let's work on the code!",
        Style: "editor"
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
        ActualInput: "",
        Style: "code",
        Operation: "CodeFix",
        AskInput: false,
        InputInContext: true,
        TextInContext: true,
        CodeInContext: true,
        Inheritance: ContextInheritance.CurrentOnly
    }
}

/** FixCodeWithInput: Fix the current code snippet with extra user inputs. */
export function FixCodeWithInput(Label?: string): ChatResponseOption {
    return {
        Label: Label ?? "Can you fix the code with my ideas?",
        Style: "code",
        Operation: "CodeFix",
        AskInput: true,
        InputInContext: true,
        TextInContext: true,
        CodeInContext: true,
        Inheritance: ContextInheritance.CurrentOnly
    }
}

/** ExplainCode: Explain the code. */
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