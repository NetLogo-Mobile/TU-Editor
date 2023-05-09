import { ChatResponseOption } from "../chat-option";
/** ChangeTopic: Generate a template change topic option. */
export declare function ChangeTopic(Label?: string): ChatResponseOption;
/** FollowUp: Generate a template follow-up option. */
export declare function FollowUp(Label?: string): ChatResponseOption;
/** EditCode: Generate a template edit code option. */
export declare function EditCode(Label?: string): ChatResponseOption;
/** AskExamples: Ask for examples. */
export declare function AskExamples(Label?: string): ChatResponseOption;
/** AskOtherExamples: Ask for other examples. */
export declare function AskOtherExamples(Label?: string): ChatResponseOption;
/** AskCode: Ask a question about the code. */
export declare function AskCode(Label?: string, Style?: string): ChatResponseOption;
/** FixCode: Fix the current code snippet. */
export declare function FixCode(Label?: string): ChatResponseOption;
