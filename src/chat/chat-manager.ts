import { CommandTab } from "src/command/command-tab";
import { OutputDisplay } from "src/command/outputs";
import { ClientChatRequest } from "./client/chat-request";
import { ChatResponseSection, ChatResponseType, IsTextLike, SectionsToJSON } from "./client/chat-response";
import { ChatThread } from "./client/chat-thread";
import { ChatNetwork } from "./chat-network";
import { ChatRole } from "./client/chat-context";
import { ChatResponseOption, ContextInheritance, ContextMessage } from "./client/chat-option";
import { ChatRecord } from "./client/chat-record";
import { SectionRenderer } from "../command/sections/section-renderer";
declare const { EditorLocalized }: any;

/** ChatManager: The interface for connecting to a chat backend. */
export class ChatManager {
    // #region " Chat Requesting "
    /** Thread: The current chat thread. */
    private Thread: ChatThread = new ChatThread();
    /** PendingRequest: The pending chat request. */
    private PendingRequest: ClientChatRequest | null = null;
    /** Reset: Reset the chat interface. */
    public Reset() {
        this.Thread = new ChatThread();
        this.PendingRequest = null;
    }
    /** SendMessage: Send a direct message to the chat backend. */ 
    public SendMessage(Content: string) {
        this.PendingRequest = this.PendingRequest ?? { Input: "" };
        this.PendingRequest.Input = Content;
        this.PendingRequest.Language = this.Thread.Language;
        this.SendRequest(this.PendingRequest);
        this.PendingRequest = null;
    }
    /** SendRequest: Send a request to the chat backend and handle its outputs. */
    private SendRequest(Request: ClientChatRequest) {
        if (this.Commands.Disabled) return;
        // Make it a record and put it in the thread
        var Record = Request as ChatRecord;
        var Subthread = this.Thread.AddToSubthread(Record);
        var Renderer = this.Outputs.RenderRecord(Record, Subthread);
        var CurrentRenderer: SectionRenderer | undefined;
        // Send the request
        var Options = 0;
        var SendRequest = () => {
            if (this.Commands.Disabled) return;
            this.Commands.HideInput();
            ChatNetwork.SendRequest(Record, this.Thread, (Section) => {
                // Create the section
                Subthread.RootID = Subthread.RootID ?? Record.ID;
                CurrentRenderer = Renderer.AddSection(Section);
                this.Outputs.ScrollToBottom();
            }, (Section) => {
                if (!CurrentRenderer) return;
                // Update the section
                CurrentRenderer.SetData(Section);
                CurrentRenderer.Render();
                this.Outputs.ScrollToBottom();
            }, (Section) => {
                Options += Section.Options?.length ?? 0;
                // Finish the section
                if (!CurrentRenderer) return;
                CurrentRenderer.SetFinalized();
                CurrentRenderer.SetData(Section);
                CurrentRenderer.Render();
                this.Outputs.ScrollToBottom();
            }).then((Record) => {
                if (Options == 0) this.Commands.ShowInput();
                console.log(Record);
            }).catch((Error) => {
                if (!this.Commands.Disabled) return;
                Renderer.AddSection({ 
                    Type: ChatResponseType.ServerError, 
                    Content: EditorLocalized.Get("Connection to server failed _", Error ?? EditorLocalized.Get("Unknown")),
                    Field: SendRequest as any
                })!.SetFinalized().Render();
                this.Commands.ShowInput();
            });
        };
        SendRequest();
    }
    // #endregion

    // #region " Options and Contexts "
    /** RequestOption: Choose a chat option and send the request. */
    public RequestOption(Option: ChatResponseOption, Section: ChatResponseSection, Record: ChatRecord) {
        // Construct the request
        this.PendingRequest = {
            Input: Option.Label,
            Option: Option,
            Operation: Option.Operation,
            SubOperation: Option.SubOperation,
        };
        // Find a parent
        this.PendingRequest.Context = { PreviousMessages: [] };
        if (Option.Inheritance !== ContextInheritance.Drop) {
            var RealParent: ChatRecord | undefined = Record;
            // If the option is transparent, find the first could-be-transparent parent
            // Otherwise, find the first non-transparent parent
            while (RealParent?.Transparent === true) {
                RealParent = this.Thread.GetRecord(RealParent.ParentID);
                if (!RealParent) break;
            }
            // Inherit the context
            if (RealParent) {
                this.PendingRequest.ParentID = RealParent?.ID;
                this.InheritContext(Option, RealParent, -1);
                if (Option.InputInContext ?? true) 
                    this.PendingRequest.Context.PreviousMessages.shift();
            }
        }
        // Send request or unlock the input
        if (Option.AskInput) {
            this.Commands.ShowInput();
        } else {
            this.SendRequest(this.PendingRequest);
        }
    }
    /** InheritContext: Inherit the context from the previous request. */
    private InheritContext(Option: ChatResponseOption | undefined, Record: ChatRecord, Layers: number = -1) {
        Option = Option ?? { Inheritance: ContextInheritance.InheritOne, Label: "" };
        var Context = this.PendingRequest!.Context!;
        if (Layers == -1) {
            switch (Option.Inheritance) {
                case ContextInheritance.Drop:
                case ContextInheritance.InheritOne:
                    // Stop after this
                    Layers = -2;
                    break;
                case ContextInheritance.InheritParent:
                    // Stop after the parent
                    Layers = 0;
                    break;
                case ContextInheritance.InheritRecursive:
                    // Continue until the root
                    Layers = -1;
                    break;
            }
        }
        // Inherit the last action (from new to old)
        this.PendingRequest!.Operation = this.PendingRequest!.Operation ?? Record.Operation;
        // Inherit the last text message (from new to old)
        switch (Option.TextInContext) {
            case ContextMessage.Nothing:
                break;
            case ContextMessage.MessagesAsText:
                Context.PreviousMessages.unshift({ 
                    Text: Record.Response.Sections.filter(IsTextLike)
                        .map(Section => Section.Content).join("\n"), 
                    Role: ChatRole.Assistant
                });
                break;
            case ContextMessage.MessagesAsJSON:
                Context.PreviousMessages.unshift({ 
                    Text: SectionsToJSON(Record.Response.Sections.filter(IsTextLike)), 
                    Role: ChatRole.Assistant
                });
                break;
            case ContextMessage.AllAsJSON:
            default:
                Context.PreviousMessages.unshift({ 
                    Text: SectionsToJSON(Record.Response.Sections.filter(IsTextLike)), 
                    Role: ChatRole.Assistant
                });
        }
        // Inherit the last input (from new to old)
        if (Option.InputInContext ?? true)
            Context.PreviousMessages.unshift({ 
                Text: Record.Input, 
                Role: ChatRole.User
            });
        // Inherit the last code message (from new to old)
        if ((Option.CodeInContext ?? true) === true && Context.CodeSnippet === undefined) {
            var Code = Record.Response.Sections.find(Section => Section.Type == ChatResponseType.Code);
            if (Code != null) Context.CodeSnippet = Code.Content;
        }
        // Inherit previous messages
        if (Layers == -2 || !Record.ParentID) return;
        // Find the parent
        var Parent = this.Thread.GetRecord(Record.ParentID);
        if (Parent == null) return;
        if (Layers == 0) Layers = -2; // Stop after the parent
        // Inherit the parent
        this.InheritContext(Parent.Option, Parent, Layers);
    }
    // #endregion
    
    // #region " Interfaces Connection "
    /** Tab: The command tab. */
    public Commands: CommandTab;
    /** Outputs: The outputs area. */
    public Outputs: OutputDisplay;
    /** Available: Whether the chat backend is available. */
    public Available: boolean = true;
    /** ThinkProcess: Whether to demonstrate the thinking processes. */
    public static ThinkProcess: boolean = false;
    /** Instance: The chat manager instance. */
    public static Instance: ChatManager;
    /** Constructor: Create a chat interface. */
    public constructor(Tab: CommandTab) {
        this.Commands = Tab;
        this.Outputs = Tab.Outputs;
        this.Reset();
        ChatManager.Instance = this;
    }
    // #endregion
}