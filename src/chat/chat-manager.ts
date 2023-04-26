import { CommandTab } from "src/command/command-tab";
import { OutputDisplay } from "src/command/outputs";
import { ChatRequest, ClientChatRequest } from "./client/chat-request";
import { ChatResponseSection, ChatResponseType } from "./client/chat-response";
import { ChatThread } from "./client/chat-thread";
import { ChatNetwork } from "./chat-network";
declare const { EditorLocalized }: any;

/** ChatManager: The interface for connecting to a chat backend. */
export class ChatManager {
    // #region " Chat Requesting "
    /** Thread: The current chat thread. */
    private Thread: ChatThread;
    /** Reset: Reset the chat interface. */
    public Reset() {
        this.Thread = new ChatThread();
    }
    /** SendMessage: Send a direct message to the chat backend. */ 
    public SendMessage(Content: string) {
        var Request: ChatRequest = {
            Input: Content,
        };
        this.SendRequest(Request);
    }
    /** SendRequest: Send a request to the chat backend and handle its outputs. */
    private SendRequest(Request: ChatRequest) {
        // UI stuff
        var Renderer = $("<div></div>").addClass("chat-response").appendTo(this.Outputs.Container);
        var CurrentRenderer: JQuery<HTMLElement> | null;
        this.Commands.HideInput();
		this.Commands.ClearInput();
        // Send the request
        ChatNetwork.SendRequest(Request, this.Thread, (Section) => {
            // Create the section
            CurrentRenderer = this.Render(CurrentRenderer, Renderer, Section, false);
        }, (Section) => {
            // Update the section
            CurrentRenderer = this.Render(CurrentRenderer, Renderer, Section, false);
        }, (Section) => {
            // Finish the section
            console.log(Section);
            this.Render(CurrentRenderer, Renderer, Section, true);
            CurrentRenderer = null;
        }).then((Record) => {
            console.log(Record);
            this.Commands.ShowInput();
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
                    .on("click", function() {
                        console.log($(this).data("option"));
                    });
            }
        }
        if (AtBottom) this.Commands.Outputs.ScrollToBottom();
        return Output;
    }
    // #endregion
}