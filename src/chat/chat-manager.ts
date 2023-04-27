import { CommandTab } from "src/command/command-tab";
import { OutputDisplay } from "src/command/outputs";
import { ClientChatRequest } from "./client/chat-request";
import { ChatResponseSection, ChatResponseType } from "./client/chat-response";
import { ChatThread } from "./client/chat-thread";
import { ChatNetwork } from "./chat-network";
import { ChatRole } from "./client/chat-context";
import { ChatResponseOption, ContextInheritance, ContextMessage } from "./client/chat-option";
import { ChatRecord } from "./client/chat-record";
declare const { EditorLocalized }: any;

/** ChatManager: The interface for connecting to a chat backend. */
export class ChatManager {
    // #region " Chat Requesting "
    /** Thread: The current chat thread. */
    private Thread: ChatThread;
    /** PendingRequest: The pending chat request. */
    private PendingRequest: ClientChatRequest;
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
        // UI stuff
        var Renderer = $(`<div class="chat-response"></div>`).appendTo(this.Outputs.Container);
        var CurrentRenderer: JQuery<HTMLElement> | null;
        this.Commands.HideInput();
		this.Commands.ClearInput();
        // Send the request
        var Options = 0;
        ChatNetwork.SendRequest(Request, this.Thread, (Section) => {
            // Create the section
            CurrentRenderer = this.Render(CurrentRenderer, Renderer, Section, false);
        }, (Section) => {
            // Update the section
            CurrentRenderer = this.Render(CurrentRenderer, Renderer, Section, false);
        }, (Section) => {
            // Finish the section
            console.log(Section);
            Options += Section.Options.length;
            this.Render(CurrentRenderer, Renderer, Section, true);
            CurrentRenderer = null;
        }).then((Record) => {
            Record.Transparent = Request.Option?.Transparent ?? false,
            Renderer.data("record", Record);
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
        var RealParent = Record;
        var RealSection = Section;
        // If the option is transparent, find the first could-be-transparent parent
        // Otherwise, find the first non-transparent parent
        // (Option.Transparent ?? false) !== true && 
        while (RealParent?.Transparent === true) {
            RealParent = this.Thread.GetRecord(RealParent.ParentID);
            if (!RealParent) {
                RealSection = undefined;
                break;
            } else {
                RealSection = RealParent.Response.Sections[RealChild.SectionIndex];
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
        var Context = this.PendingRequest.Context;
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
        this.PendingRequest.Operation = this.PendingRequest.Operation ?? Record.Operation;
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
                Text: this.PendingRequest.Input, 
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
        var ParentSection = Parent.Response.Sections[Record.SectionIndex];
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
    public ThinkProcess: boolean = false;
    /** Constructor: Create a chat interface. */
    public constructor(Tab: CommandTab) {
        this.Commands = Tab;
        this.Outputs = Tab.Outputs;
        this.Reset();
    }
    // #endregion

    // #region " Message Rendering "
    /** Render: Render an AI response section onto the screen element. */
    private Render(Output: JQuery<HTMLElement> | null, Renderer: JQuery<HTMLElement>, Section: ChatResponseSection, Finalize: boolean): JQuery<HTMLElement> | null {
        if (Output == null && (Section.Content != "" || Section.Options?.length > 0))
            Output = $(`<div class="chat-section output"></div>`).appendTo(Renderer);
        if (Output == null) return;
        Output.data("section", Section);
        // Clear the output
        var ChatManager = this;
        var AtBottom = this.Outputs.IsAtBottom();
        Output.empty();
        // Render the section
        switch (Section.Type) {
            case ChatResponseType.Text:
                // Filter the content
                var Content = Section.Content;
                if (!this.ThinkProcess && 
                    (Content.startsWith("Parameters:") || Content.startsWith("Thoughts:") || Content.startsWith("Input:"))) {
                    var OutputIndex = Content.indexOf("\nOutput:");
                    if (OutputIndex == -1) {
                        if (!Finalize) Content = EditorLocalized.Get("I am planning for the answer...");
                        else Content = "";
                    } else Content = Content.substring(OutputIndex + 8).trim();
                }
                if (Content.startsWith("Output: "))
                    Content = Content.substring(8).trim();
                // Create the paragraph
                if (Section.Index == 0 || Content != "") {
                    var Paragraph = $(`<p><span class="assistant">assistant&gt;</span>&nbsp;<span></span><p>`);
                    Paragraph.appendTo(Output);
                    Paragraph.children("span:eq(1)").text(Content);
                }
                break;
            case ChatResponseType.Code:
                var Code = Section.Content.trim();
                // Remove the first line
                var LineBreak = Code.indexOf("\n");
                if (LineBreak == -1) return;
                Code = Code.substring(LineBreak + 1);
                // Remove the last ```
                if (Code.endsWith("```"))
                    Code = Code.substring(0, Code.length - 3).trimEnd();
                // Create the code block
                if (Finalize) {
                    var Element = $(`<code></code>`).appendTo(Output);
                    this.Commands.AnnotateCode(Element, Code, true);
                } else {
                    $(`<pre></pre>`).appendTo(Output).text(Code.trim());
                }
                break;
        }
        // Render the options
        if (Section.Options != null) {
            for (var Option of Section.Options) {
                var Link = $(`<p class="output option ${Option.Style ?? "generated"}">- <a href="javascript:void(0)"></a></p>`);
                Link.appendTo(Output);
                Link.find("a").data("option", Option).text(Option.LocalizedLabel ?? Option.Label)
                    .on("click", function() { ChatManager.OptionHandler($(this)); });
            }
        }
        if (AtBottom) this.Commands.Outputs.ScrollToBottom();
        return Output;
    }
    /** OptionHandler: Handling an option. */
    private OptionHandler(OptionElement: JQuery<HTMLElement>) {
        var Option = OptionElement.data("option") as ChatResponseOption;
        var Section = OptionElement.parents(".chat-section").data("section") as ChatResponseSection;
        var Record = OptionElement.parents(".chat-response").data("record") as ChatRecord;
        this.RequestOption(Option, Section, Record);
    }
    // #endregion
}