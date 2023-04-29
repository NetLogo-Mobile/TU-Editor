import { CommandTab } from "src/command/command-tab";
import { OutputDisplay } from "src/command/outputs";
import { ClientChatRequest } from "./client/chat-request";
import { ChatResponseSection, ChatResponseType } from "./client/chat-response";
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
        this.Commands.HideInput();
		this.Commands.ClearInput();
        // Make it a record and put it in the thread
        var Record = Request as ChatRecord;
        var Subthread = this.Thread.AddToSubthread(Record);
        var Renderer = this.Outputs.RenderRecord(Record, Subthread);
        var CurrentRenderer: SectionRenderer;
        // Send the request
        var Options = 0;
        ChatNetwork.SendRequest(Record, this.Thread, (Section) => {
            // Create the section
            Subthread.RootID = Subthread.RootID ?? Record.ID;
            CurrentRenderer = Renderer.AddSection(Section);
            this.Outputs.ScrollToBottom();
        }, (Section) => {
            // Update the section
            CurrentRenderer.SetData(Section);
            CurrentRenderer.Render();
            this.Outputs.ScrollToBottom();
        }, (Section) => {
            console.log(Section);
            // Finish the section
            Options += Section.Options?.length ?? 0;
            CurrentRenderer.SetFinalized();
            CurrentRenderer.SetData(Section);
            CurrentRenderer.Render();
            this.Outputs.ScrollToBottom();
        }).then((Record) => {
            if (Options == 0) this.Commands.ShowInput();
            console.log(Record);
        }).catch((Error) => {
            if (!this.Commands.Disabled) return;
            var Output = this.Outputs.PrintOutput(
                EditorLocalized.Get("Connection to server failed _", Error), "RuntimeError");
            Output.append($("<a></a>").attr("href", "javascript:void(0)").text(EditorLocalized.Get("Reconnect")).on("click", () => {
                this.Commands.HideInput();
                this.SendRequest(Request);
            }));
            this.Commands.ShowInput();
        });
    }
    // #endregion

    // #region " Options and Contexts "
    /** RequestOption: Choose a chat option and send the request. */
    private RequestOption(Option: ChatResponseOption, Section: ChatResponseSection, Record: ChatRecord) {
        // Construct the request
        this.PendingRequest = {
            Input: Option.Label,
            Option: Option,
            Operation: Option.Operation,
            SubOperation: Option.SubOperation,
        };
        // Find a parent
        var RealChild = Record;
        var RealParent: ChatRecord | undefined = Record;
        var RealSection: ChatResponseSection | undefined = Section;
        // If the option is transparent, find the first could-be-transparent parent
        // Otherwise, find the first non-transparent parent
        while (RealParent?.Transparent === true) {
            RealParent = this.Thread.GetRecord(RealParent.ParentID);
            if (!RealParent) {
                RealSection = undefined;
                break;
            } else {
                RealSection = RealParent.Response.Sections[RealChild.SectionIndex!];
                RealChild = RealParent;
            }
        }
        // Inherit the context
        this.PendingRequest.Context = { PreviousMessages: [] };
        if (RealParent && RealSection) {
            this.PendingRequest.ParentID = RealParent?.ID;
            this.PendingRequest.SectionIndex = RealSection?.Index;
            this.InheritContext(Option, RealSection, RealParent, -1);
            if (Option.InputInContext ?? true) 
                this.PendingRequest.Context.PreviousMessages.shift();
        }
        // Although I dropped my parent contexts, I still want to keep myself in the loop
        if (Option.Inheritance == ContextInheritance.Drop) Option.Inheritance = ContextInheritance.InheritOne;
        // Send request or unlock the input
        if (Option.AskInput) {
            this.Commands.ShowInput();
        } else {
            this.SendRequest(this.PendingRequest);
        }
    }
    /** InheritContext: Inherit the context from the previous request. */
    private InheritContext(Option: ChatResponseOption | undefined, Section: ChatResponseSection, Record: ChatRecord, Layers: number = -1) {
        Option = Option ?? { Inheritance: ContextInheritance.InheritOne, Label: "" };
        var Context = this.PendingRequest!.Context!;
        if (Layers == -1) {
            switch (Option.Inheritance) {
                case ContextInheritance.Drop:
                    // Stop right here
                    return;
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
            case ContextMessage.Section:
                Context.PreviousMessages.unshift({ 
                    Text: Section.Content, 
                    Role: ChatRole.Assistant
                });
                break;
            case ContextMessage.EntireMessage:
            default:
                Context.PreviousMessages.unshift({ 
                    Text: Record.Response.Sections.filter(Section => Section.Type != ChatResponseType.Code)
                        .map(Section => Section.Content).join("\n"), 
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
        var ParentSection = Parent.Response.Sections[Record.SectionIndex!];
        if (ParentSection == null) return;
        if (Layers == 0) Layers = -2; // Stop after the parent
        // Inherit the parent
        this.InheritContext(Parent.Option, ParentSection, Parent, Layers);
    }
    // #endregion
    
    // #region " Interfaces Connection "
    /** Tab: The command tab. */
    private Commands: CommandTab;
    /** Outputs: The outputs area. */
    private Outputs: OutputDisplay;
    /** Available: Whether the chat backend is available. */
    public Available: boolean = true;
    /** ThinkProcess: Whether to demonstrate the thinking processes. */
    public static ThinkProcess: boolean = false;
    /** Constructor: Create a chat interface. */
    public constructor(Tab: CommandTab) {
        this.Commands = Tab;
        this.Outputs = Tab.Outputs;
        this.Reset();
    }
    // #endregion

    // #region " Message Rendering "
    /** OptionHandler: Handling an option. */
    private OptionHandler(OptionElement: JQuery<HTMLElement>) {
        var Option = OptionElement.data("option") as ChatResponseOption;
        var Section = OptionElement.parents(".chat-section").data("section") as ChatResponseSection;
        var Record = OptionElement.parents(".chat-response").data("record") as ChatRecord;
        this.RequestOption(Option, Section, Record);
    }
    // #endregion
}