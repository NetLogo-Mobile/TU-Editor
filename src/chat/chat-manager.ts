import { CommandTab } from "src/command/command-tab";
import { OutputDisplay } from "src/command/outputs";
import { ChatRequest, ClientChatRequest } from "./client/chat-request";
import { ChatResponseSection, ChatResponseType } from "./client/chat-response";
import { ChatThread } from "./client/chat-thread";
import { ChatNetwork } from "./chat-network";
import { ChatContext, ChatRole } from "./client/chat-context";
import { ChatResponseOption, ContextInheritance, ContextMessage } from "./client/chat-option";
import { ChatRecord } from "./client/chat-record";
declare const { EditorLocalized }: any;

/** ChatManager: The interface for connecting to a chat backend. */
export class ChatManager {
    // #region " Chat Requesting "
    /** Thread: The current chat thread. */
    private Thread: ChatThread;
    /** PendingRequest: The pending chat request. */
    private PendingRequest: ChatRequest;
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
    private SendRequest(Request: ChatRequest) {
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
            console.log(Record);
            Renderer.data("record", Record);
            if (Options == 0) this.Commands.ShowInput();
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
            Option: Option.Label,
            Operation: Option.Operation,
            SubOperation: Option.SubOperation
        };
        // Construct the context
        var Context: ChatContext = { PreviousMessages: [] };
        // Inherit the context
        switch (Option.Inheritance) {
            case ContextInheritance.Drop:
                break;
        }
        // Inherit the last message
        switch (Option.MessageInContext) {
            case ContextMessage.Nothing:
                break;
            case ContextMessage.Section:
                Context.PreviousMessages.push({ 
                    Text: Section.Content, 
                    Role: ChatRole.Assistant
                });
                break;
            case ContextMessage.EntireMessage:
            default:
                Context.PreviousMessages.push({ 
                    Text: Record.Response.Sections.map(Section => Section.Content).join("\n"), 
                    Role: ChatRole.Assistant
                });
        }
        this.PendingRequest.Context = Context;
        // Send request or unlock the input
        if (Option.AskInput) {
            this.Commands.ShowInput();
        } else {
            this.SendRequest(this.PendingRequest);
        }
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
        if (Output == null && Section.Content != "")
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
                if (!this.ThinkProcess && (Content.startsWith("Parameters:") || Content.startsWith("Thoughts:"))) {
                    var OutputIndex = Content.indexOf("\nOutput: ");
                    if (OutputIndex == -1) {
                        if (!Finalize) Content = EditorLocalized.Get("I am planning for the answer...");
                        else Content = "";
                    } else Content = Content.substring(OutputIndex + 9);
                }
                // Create the paragraph
                var Paragraph = $(`<p><span class="assistant">assistant&gt;</span>&nbsp;<span></span><p>`);
                Paragraph.appendTo(Output);
                Paragraph.children("span:eq(1)").text(Content);
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
                var Link = $(`<p class="output option">- <a href="javascript:void(0)"></a></p>`);
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