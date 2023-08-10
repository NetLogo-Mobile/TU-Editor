import { CommandTab } from "../command/command-tab";
import { OutputDisplay } from "../command/displays/output";
import { ClientChatRequest } from "./client/chat-request";
import { ChatResponseType, ExcludeCode, GetField, IsTextLike } from "./client/chat-response";
import { ChatThread } from "./client/chat-thread";
import { ChatNetwork } from "./chat-network";
import { ChatRole } from "./client/chat-context";
import { ChatResponseOption, ContextInheritance } from "./client/chat-option";
import { ChatRecord } from "./client/chat-record";
import { SectionRenderer } from "../command/sections/section-renderer";
import { Localized } from "../../../CodeMirror-NetLogo/src/editor";

/** ChatManager: The interface for connecting to a chat backend. */
export class ChatManager {
    // #region " Chat Requesting "
    /** Thread: The current chat thread. */
    public Thread: ChatThread = new ChatThread();
    /** PendingRequest: The pending chat request. */
    public PendingRequest: ClientChatRequest | null = null;
    /** Reset: Reset the chat interface. */
    public Reset() {
        var Language = this.Thread.Language;
        this.Thread = new ChatThread();
        this.Thread.Language = Language;
        this.PendingRequest = null;
    }
    /** SendMessage: Send a direct message to the chat backend. */ 
    public SendMessage(Content: string, Friendly?: string) {
        this.PendingRequest = this.PendingRequest ?? { Input: "" };
        this.PendingRequest.Input = Content.trim();
        this.PendingRequest.FriendlyInput = Friendly;
        this.PendingRequest.Language = this.Thread.Language;
        // Clarify the pending request
        var Context = this.PendingRequest.Context ?? { };
        this.PendingRequest.Context = Context
        if (Context.PendingActions && Context.PendingActions.length > 0) {
            var LastAction = Context.PendingActions[Context.PendingActions.length - 1];
            if (LastAction.Observation === "$Input$") {
                LastAction.Observation = this.PendingRequest.Input;
                this.PendingRequest.IgnoreInput = true;
                this.PendingRequest.FriendlyInput = this.PendingRequest.FriendlyInput ?? this.PendingRequest.Input;
            }
        }
        // Send the request
        this.SendRequest(this.PendingRequest);
        this.PendingRequest = null;
    }
    /** IsRequesting: Whether we are currently requesting anything. */
    public static IsRequesting: boolean = false;
    /** SendRequest: Send a request to the chat backend and handle its outputs. */
    public SendRequest(Request: ClientChatRequest) {
        if (ChatManager.IsRequesting) return;
        Request.Language = this.Thread.Language;
        Request.Context = Request.Context ?? { };
        // Make it a record and put it in the thread
        var Record = Request as ChatRecord;
        var Subthread = this.Thread.AddToSubthread(Record);
        var RecordRenderer = this.Outputs.RenderRecord(Record, Subthread);
        var CurrentRenderer: SectionRenderer | undefined;
        // Project contexts
        Record.Context!.ProjectName = this.Commands.Editor.ProjectName;
        Record.Context!.ProjectContext = this.Commands.Editor.GetContext();
        // Send the request
        var SendRequest = () => {
            if (ChatManager.IsRequesting) return;
            var Scrolled = false;
            ChatManager.IsRequesting = true;
            RecordRenderer.ActivateSelf("activated");
            RecordRenderer.SetFinalized(false);
            this.Commands.DisableInput();
            ChatNetwork.SendRequest(Record, this.Thread, (Section) => {
                // Create the section
                Subthread.RootID = Subthread.RootID ?? Record.ID;
                CurrentRenderer = RecordRenderer.AddSection(Section);
                CurrentRenderer?.Render();
                if (!Scrolled) {
                    this.Outputs.ScrollToElement(RecordRenderer.Container);
                    Scrolled = true;
                }
            }, (Section) => {
                // Update the section
                this.Commands.Outputs.ScrollToBottomIfNeeded(() => {
                    if (!CurrentRenderer) return;
                    CurrentRenderer.SetData(Section);
                    CurrentRenderer.Render();
                });
            }, (Section) => {
                // Finish the section
                this.Commands.Outputs.ScrollToBottomIfNeeded(() => {
                    if (!CurrentRenderer) return;
                    // Special handling for ServerErrors
                    if (Section.Type == ChatResponseType.ServerError && Section.Field !== "Irrecoverable") {
                        if (Section.Field == "Temperature")
                            Record.Temperature = Record.Temperature ?? 0 + 0.4;
                        Section.Parsed = SendRequest;
                    }
                    CurrentRenderer.SetFinalized();
                    CurrentRenderer.SetData(Section);
                    CurrentRenderer.Render();
                });
            }).then((Record) => {
                console.log(Record);
                this.Commands.Outputs.ScrollToBottomIfNeeded(() => {
                    // Finish the record
                    RecordRenderer.SetFinalized();
                    RecordRenderer.SetData(Record);
                    RecordRenderer.Parent?.Render();
                    // Show the input if there are no options
                    if (Record.Response.Options.length == 0) {
                        this.PendingRequest = null;
                        this.Commands.EnableInput();
                    } else this.Commands.SetDisabled(false);
                    // Finish the request
                    this.FinishRequest();
                });
            }).catch((Error) => {
                if (!ChatManager.IsRequesting) return;
                this.Commands.Outputs.ScrollToBottomIfNeeded(() => {
                    RecordRenderer.SetFinalized();
                    RecordRenderer.AddSection({ 
                        Type: ChatResponseType.ServerError, 
                        Content: Localized.Get("Connection to server failed _", Error ?? Localized.Get("Unknown")),
                        Parsed: SendRequest
                    })!.SetFinalized().Render();
                    this.PendingRequest = null;
                    this.Commands.EnableInput();
                    this.FinishRequest();
                });
            });
        };
        SendRequest();
    }
    /** FinishRequest: Finish the current request. */
    private FinishRequest() {
        ChatManager.IsRequesting = false;
        this.Outputs.RestartBatch();
        this.Outputs.Tab.RefreshPlaceholder();
    }
    /** GetPendingParent: Get the pending parent record. */
    public GetPendingParent(): ChatRecord | undefined {
        if (this.PendingRequest?.ParentID)
            return this.Thread.GetRecord(this.PendingRequest.ParentID);
    }
    // #endregion

    // #region " Options and Contexts "
    /** RequestOption: Choose a chat option and send the request. */
    public RequestOption(Option: ChatResponseOption, Record?: ChatRecord, Postprocessor?: (Request: ClientChatRequest) => void): boolean {
        if (this.Commands.Disabled) return false;
        // Construct the request
        this.PendingRequest = {
            Input: Option.ActualInput ?? Option.LocalizedLabel ?? Option.Label,
            Option: Option,
            Operation: Option.Operation,
            SubOperation: Option.SubOperation,
        };
        if (Option.ActualInput)
            this.PendingRequest.FriendlyInput = Option.LocalizedLabel ?? Option.Label;
        // Find a parent
        this.PendingRequest.Context = { };
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
            }
        } else {
            this.Outputs.ActivateSubthread();
        }
        // Send request or unlock the input
        Postprocessor?.(this.PendingRequest);
        if (Option.AskInput) {
            this.Commands.EnableInput();
            this.Commands.Galapagos.Focus();
            this.Commands.Outputs.ScrollToBottom();
        } else {
            this.SendRequest(this.PendingRequest);
        }
        return true;
    }
    /** InheritContext: Inherit the context from the previous request. */
    private InheritContext(Option: ChatResponseOption | undefined, Record: ChatRecord, Layers: number = -1) {
        Option = Option ?? { Inheritance: ContextInheritance.CurrentOnly, Label: "" };
        var Context = this.PendingRequest!.Context!;
        Context.PreviousMessages = Context.PreviousMessages ?? [];
        Context.PendingActions = Context.PendingActions ?? [];
        if (Layers == -1) {
            switch (Option.Inheritance) {
                case ContextInheritance.Drop:
                case ContextInheritance.CurrentOnly:
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
        // Inherit the action log
        var AsAction = false; // Whether the last message is an action
        if (Context.PreviousMessages.length === 0) {
            var Action = GetField(Record.Response.Sections, "Action")?.Content;
            var Parameter = GetField(Record.Response.Sections, "Parameter")?.Content;
            var Observation = GetField(Record.Response.Sections, "Observation");
            if (Observation && Action && Parameter) {
                var ActionLog = {
                    Action: Action.trim(),
                    Parameter: Parameter.trim(),
                    Observation: ""
                };
                Object.defineProperty(ActionLog, "Observation", { 
                    get: () => Observation!.Content?.trim() ?? "",
                    set: (Value) => Observation!.Content = Value
                });
                Context.PendingActions.unshift(ActionLog);
                AsAction = true;
            }
        }
        // Inherit the last text message (from new to old)
        if ((Option.TextInContext ?? true) && !AsAction) {
            Context.PreviousMessages.unshift({ 
                Text: Record.Response.Sections.filter(ExcludeCode).filter(IsTextLike)
                    .map(Section => Section.Content).join("\n"), 
                Role: ChatRole.Assistant
            });
        }
        // Inherit the last input (from new to old)
        if ((Option.InputInContext ?? true) && Record.Input !== "")
            Context.PreviousMessages.unshift({ 
                Text: Record.Input, 
                Role: ChatRole.User
            });
        // Inherit the last code message (from new to old)
        if ((Option.CodeInContext ?? true) === true && Context.CodeSnippet === undefined) {
            var Code = Record.Response.Sections.find(Section => Section.Type == ChatResponseType.Code || Section.Field == "Code");
            if (Code != null) Context.CodeSnippet = Code.Content;
            else Context.CodeSnippet = Record.Context?.CodeSnippet;
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
    public static Available: boolean = false;
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