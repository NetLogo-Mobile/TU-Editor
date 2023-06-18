import { ChatResponseOption } from "../chat-option";
import { DiagnosticType } from "../languages/netlogo-context";
/** ChangeTopic: Generate a template change topic option. */
export declare function ChangeTopic(Label?: string): ChatResponseOption;
/** NewTopic: Generate a template new topic option. */
export declare function NewTopic(Input: string, Label?: string): ChatResponseOption;
/** FollowUp: Generate a template follow-up option. */
export declare function FollowUp(Label?: string): ChatResponseOption;
/** Clarify: Generate a template clarification option. */
export declare function Clarify(Label?: string): ChatResponseOption;
/** EditCode: Generate a template edit code option. */
export declare function EditCode(Label?: string): ChatResponseOption;
/** ExampleCode: Ask for an example code. */
export declare function ExampleCode(Label?: string): ChatResponseOption;
/** WriteCodeWithPlan: Write a code snippet based on the plan. */
export declare function WriteCodeWithPlan(AskMore: boolean): ChatResponseOption;
/** AskCode: Ask a question about the code. */
export declare function AskCode(Label?: string, Style?: string, CodeOnly?: boolean): ChatResponseOption;
/** FixCode: Fix the current code snippet. */
export declare function FixCode(Label?: string, Errors?: string): ChatResponseOption;
/** ExplainCode: Explain the code. */
export declare function ExplainCode(Label?: string): ChatResponseOption;
/** ExplainErrors: Explain the errors. */
export declare function ExplainErrors(Type: DiagnosticType, Label?: string): ChatResponseOption;
