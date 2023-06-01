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
/** AskFurther: Generate a template ask further option. */
export declare function AskFurther(Label?: string): ChatResponseOption;
/** EditCode: Generate a template edit code option. */
export declare function EditCode(Label?: string): ChatResponseOption;
/** ExampleCode: Ask for an example code. */
export declare function ExampleCode(Label?: string): ChatResponseOption;
/** AskCode: Ask a question about the code. */
export declare function AskCode(Label?: string, Style?: string, Transparent?: boolean): ChatResponseOption;
/** FixCode: Fix the current code snippet. */
export declare function FixCode(Label?: string): ChatResponseOption;
/** ExplainErrors: Explain the errors. */
export declare function ExplainErrors(Type: DiagnosticType, Label?: string): ChatResponseOption;