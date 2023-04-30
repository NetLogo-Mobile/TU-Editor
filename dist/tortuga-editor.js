(function (exports) {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    /** Tab: A tab in the code editor. */
    class Tab {
        /** Constructor: Create an editor tab. */
        constructor(Container, Editor) {
            // Whether it is visible.
            this.Visible = false;
            this.Editor = Editor;
            this.Container = Container;
        }
        /** Show: Show the tab. */
        Show() {
            this.Editor.CurrentTab = this;
            this.Editor.HideAllTabs();
            this.Container.style.display = "block";
            this.Visible = true;
        }
        /** Hide: Hide the tab. */
        Hide() {
            this.Container.style.display = "none";
            this.Visible = false;
            this.Blur();
        }
        /** Blur: Blur the tab's editor. */
        Blur() {
        }
        /** Reset: Reset the status. */
        Reset() {
        }
        /** SyncSize: Resize the visible region. */
        SyncSize() {
            this.Resize(window.visualViewport.height, document.body.scrollHeight);
        }
        /** Resize: Resize the visible region. */
        Resize(ViewportHeight, ScrollHeight) {
            $(this.Editor.Container).css("height", `${ViewportHeight}px`);
            return true;
        }
    }

    // Localized: Localized support.
    const Localized = function () {
        var Localized = {};
        // Initialize: Initialize the manager with given data.
        Localized.Initialize = function (Data, Language) {
            Localized.Data = Data;
            EditorLocalized.Switch(Language);
            $(".Localized").each((Index, Target) => {
                $(Target).text(Localized.Get($(Target).text()));
            });
        };
        // Get: Get localized string.
        Localized.Get = function (Source) {
            if (Localized.Data && Localized.Data.hasOwnProperty(Source))
                return Localized.Data[Source];
            return Source;
        };
        return Localized;
    }();
    // RotateScreen: Show rotate screen prompt.
    const RotateScreen = function () {
        (function ($, undefined$1) {
            $.fn.asOverlay = function (Timeout = 3000, Animation = 300) {
                this.Hide = () => this.fadeOut(Animation);
                this.Show = () => {
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => this.fadeOut(Animation), Timeout);
                    this.fadeIn(Animation);
                };
                return this;
            };
        })(jQuery);
        var RotateScreen = $(".rotate-screen");
        RotateScreen.asOverlay().click(() => RotateScreen.hide());
        return RotateScreen;
    };

    /** TransformLinks: Transform the embedded links. */
    function TransformLinks(Editor, Element) {
        if (TurtleEditor.PostMessage != null)
            return;
        Element.find("a").each((Index, Link) => {
            var LinkElement = $(Link);
            var Href = LinkElement.attr("href");
            LinkElement.attr("href", "javascript:void(0);");
            LinkElement.on("click", () => Editor.Call({ Type: "Visit", Target: Href }));
        });
    }
    /** LinkCommand: Generate a link for another command. */
    function LinkCommand(Query) {
        Query.each((Index, Item) => {
            var Current = $(Item);
            var Target = Current.attr("target");
            if (Target == null)
                Target = Current.text();
            var Objective = Current.attr("objective");
            if (!Objective)
                Objective = "null";
            Current.attr("href", "javascript:void(0)");
            Current.attr("onclick", `this.ExecuteCommand(${Objective}, '${Target}')`);
        });
        return Query;
    }
    /** RenderAgent: Render tips for an agent type. */
    function RenderAgent(Agent) {
        var Message = Agent;
        switch (Agent) {
            case "turtles":
                Message = `${Localized.Get("海龟")}🐢`;
                break;
            case "patches":
                Message = `${Localized.Get("格子")}🔲`;
                break;
            case "links":
                Message = `${Localized.Get("链接")}🔗`;
                break;
            case "observer":
                Message = `${Localized.Get("观察者")}🔎`;
                break;
            case "utilities":
                Message = `${Localized.Get("工具")}🔨`;
                break;
        }
        return Message;
    }

    /** FullTextDisplay: Display the full-text help information. */
    class FullTextDisplay {
        /** Constructor: Create a new full-text display. */
        constructor(Tab) {
            /** RequestedTab: The tab that requested the full text. */
            this.RequestedTab = null;
            this.Tab = Tab;
            this.Container = $(Tab.Container).find(".command-fulltext");
        }
        /** ShowFullText: Show the full text of a command. */
        ShowFullText(Data) {
            this.RequestedTab = this.Tab.Editor.CurrentTab;
            if (!this.Tab.Visible)
                this.Tab.Show();
            // Change the status
            this.Container.show();
            // Render the subject
            this.Container.find("h2 strong").text(Data["display_name"]);
            this.Container.find("h2 span").text(`(${Data["agents"].map((Agent) => `${RenderAgent(Agent)}`).join(", ")})`);
            // Render the list
            var SeeAlso = this.Container.find("ul.SeeAlso").empty();
            for (var Primitive in Data["see_also"])
                LinkCommand($(`<li><a class="command" target="help ${Primitive}">${Primitive}</a> - ${Data["see_also"][Primitive]}</li>`).appendTo(SeeAlso).find("a"));
            // Machine-translation
            var Translator = this.Container.find(".translator");
            if (Data["translation"] != null && Data["verified"] != true)
                Translator.show();
            else
                Translator.hide();
            var Original = Translator.find("a.Original").bind("click", () => {
                Original.hide();
                Translation.show();
                SetCode(Data["content"]);
            }).parent().show();
            var Translation = Translator.find("a.Translation").bind("click", () => {
                Translation.hide();
                Original.show();
                SetCode(Data["translation"]);
            }).parent().hide();
            // Render the full text
            var SetCode = (Content) => {
                if (Content != null)
                    this.Container.find("div.fulltext")
                        .html(new showdown.Converter().makeHtml(Content));
                this.Tab.AnnotateCode(this.Container.find("code"), undefined, true);
                this.Container.scrollTop(0);
            };
            SetCode(Data["translation"] != null ? Data["translation"] : Data["content"]);
            // Acknowledge
            TransformLinks(this.Tab.Editor, this.Container.find(".Acknowledge").html(Data["acknowledge"]));
        }
        /** HideFullText: Hide the full text mode. */
        HideFullText() {
            var _a;
            if (!this.Container.is(":visible"))
                return;
            this.Container.hide();
            (_a = this.RequestedTab) === null || _a === void 0 ? void 0 : _a.Show();
        }
    }

    /** UIRenderer: Abstract class for rendering UI elements. */
    class UIRenderer {
        /** ContainerInitializer: The initializer for the container. */
        ContainerInitializer() {
            return $("<div></div>");
        }
        /** Constructor: Create a new UI renderer. */
        constructor() {
            /** Dirty: Whether the renderer is dirty and needs to be updated. */
            this.Dirty = false;
            /** Children: The children UI renderers. */
            this.Children = [];
            this.Container = this.ContainerInitializer();
        }
        /** SetDirty: Set the dirty status of the renderer. */
        SetDirty(Status) {
            var _a;
            this.Dirty = Status;
            if (Status)
                (_a = this.Parent) === null || _a === void 0 ? void 0 : _a.SetDirty(Status);
            return this;
        }
        /** Render: Render the UI element if it is dirty. */
        Render() {
            if (this.Dirty) {
                for (var Child of this.Children)
                    Child.Render();
                this.RenderInternal();
                this.Dirty = false;
            }
            return this;
        }
        /** AddChild: Add a child renderer. */
        AddChild(Renderer, Append = true) {
            this.Children.push(Renderer);
            if (Append)
                this.Container.append(Renderer.Container);
            Renderer.Parent = this;
            return this;
        }
        /** DeactivateAll: Deactivate all renderers. */
        DeactivateAll(Class) {
            this.Children.forEach((Child) => {
                Child.Container.removeClass(Class);
            });
            return this;
        }
        /** ActivateSelf: Activate the renderer with a class name and deactivate all other renderers. */
        ActivateSelf(Class) {
            var _a;
            (_a = this.Parent) === null || _a === void 0 ? void 0 : _a.Children.forEach((Child) => {
                if (Child == this)
                    Child.Container.addClass(Class);
                else
                    Child.Container.removeClass(Class);
            });
            return this;
        }
        /** SetStatus: Set the status of the renderer. */
        SetStatus(Status) {
            var _a;
            (_a = this.Parent) === null || _a === void 0 ? void 0 : _a.SetStatus(Status);
            return this;
        }
    }
    /** UIRendererOf: Abstract class for rendering UI elements. */
    class UIRendererOf extends UIRenderer {
        /** SetData: Set the data to render. */
        SetData(Data) {
            this.Data = Data;
            this.SetDirty(true);
            return this;
        }
        /** GetData: Get the data for rendering. */
        GetData() {
            return this.Data;
        }
    }

    /** NewChatResponse: Creates a new chat response. */
    /** ChatResponseType: The type for the chat response. */
    var ChatResponseType;
    (function (ChatResponseType) {
        /** Start: The response is a start message. */
        ChatResponseType[ChatResponseType["Start"] = -1] = "Start";
        /** Finish: The response is a finish message. */
        ChatResponseType[ChatResponseType["Finish"] = -2] = "Finish";
        /** Text: The response is a text block. */
        ChatResponseType[ChatResponseType["Text"] = 0] = "Text";
        /** Code: The response is a code block. */
        ChatResponseType[ChatResponseType["Code"] = 1] = "Code";
        /** JSON: The response is a JSON block. */
        ChatResponseType[ChatResponseType["JSON"] = 2] = "JSON";
        /** CompileError: The response is a compile error message. */
        ChatResponseType[ChatResponseType["CompileError"] = 3] = "CompileError";
        /** RuntimeError: The response is a runtime error message. */
        ChatResponseType[ChatResponseType["RuntimeError"] = 4] = "RuntimeError";
        /** ServerError: The response is a server error message. */
        ChatResponseType[ChatResponseType["ServerError"] = 5] = "ServerError";
    })(ChatResponseType || (ChatResponseType = {}));

    /** ChatThread: Record a conversation between human-AI. */
    class ChatThread {
        constructor() {
            /** Records: The chat records of the thread. */
            this.Records = {};
            /** Subthreads: The subthreads of the conversation. */
            this.Subthreads = [];
        }
        /** GetRecord: Get a record by its parent ID. */
        GetRecord(ParentID) {
            if (!ParentID)
                return undefined;
            return this.Records[ParentID];
        }
        /** GetSubthread: Get a specific subthread. */
        GetSubthread(RootID) {
            return this.Subthreads.find((Subthread) => Subthread.RootID === RootID);
        }
        /** AddToSubthread: Add a record to a subthread. */
        AddToSubthread(Record) {
            // Find the parent
            var Parent = Record;
            while (Parent.ParentID) {
                Parent = this.Records[Parent.ParentID];
            }
            // Find or create a subthread
            var Subthread = this.GetSubthread(Parent.ID);
            if (!Subthread) {
                Subthread = { RootID: Parent.ID, Records: [] };
                this.Subthreads.push(Subthread);
            }
            // Add the record
            Subthread.Records.push(Record);
            return Subthread;
        }
    }

    /** SSEClient: A simple client for handling Server-Sent Events. */
    class SSEClient {
        /** Constructor: Create a new SSEClient instance. */
        constructor(url, authorization, payload) {
            this.url = url;
            this.authorization = authorization;
            this.lastEventId = '';
            this.payload = JSON.stringify(payload);
            this.Request = new XMLHttpRequest();
        }
        /**
         * Listen: Start listening to the SSE stream
         * @param {Function} onMessage Callback function for handling the received message
         */
        Listen(onMessage, onError) {
            this.Request.open('POST', this.url, true);
            this.Request.setRequestHeader('Cache-Control', 'no-cache');
            this.Request.setRequestHeader('Content-Type', 'application/json');
            this.Request.setRequestHeader('Authorization', `Bearer ${this.authorization}`);
            this.Request.setRequestHeader('Accept', 'text/event-stream');
            // If we have a last event ID, set the header to resume from that point
            if (this.lastEventId) {
                this.Request.setRequestHeader('Last-Event-ID', this.lastEventId);
            }
            // Handle the received message
            var responseCursor = 0;
            this.Request.onreadystatechange = () => {
                if (this.Request.status === 200) {
                    const messages = this.Request.responseText.substring(responseCursor).trim().split('\n\n');
                    responseCursor = this.Request.responseText.length;
                    messages.forEach((message) => {
                        const data = this.parseMessage(message);
                        if (data) {
                            this.lastEventId = data.id;
                            onMessage(data);
                        }
                    });
                }
                else {
                    onError.call(this.Request);
                }
            };
            // Handle errors
            this.Request.onerror = onError;
            this.Request.send(this.payload);
        }
        /** Close: Stop listening to the SSE stream. */
        Close() {
            if (this.Request) {
                this.Request.abort();
            }
        }
        /**
         * parseMessage: Parse the received message from the SSE stream
         * @param {string} message The raw message received from the SSE stream
         * @returns {StreamData | null} The parsed message as a StreamData object or null if the message is empty
         */
        parseMessage(message) {
            if (!message)
                return null;
            const lines = message.split('\n');
            const data = {
                id: '',
                event: '',
                data: '',
            };
            lines.forEach((line) => {
                const index = line.indexOf(':');
                var key = line.substring(0, index).trim();
                var value = line.substring(index + 1).trim();
                switch (key) {
                    case 'id':
                        data.id = value;
                        break;
                    case 'event':
                        data.event = value;
                        break;
                    case 'data':
                        data.data = value;
                        break;
                }
            });
            return data;
        }
    }

    /** ChatNetwork: Class that handles the network communication for the chat. */
    class ChatNetwork {
        /** SendRequest: Send a request to the chat backend and handle its outputs. */
        static SendRequest(Record, Thread, NewSection, UpdateSection, FinishSection) {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                // Build the record
                Record.UserID = Thread.UserID;
                Record.ThreadID = Thread.ID;
                Record.Transparent = (_b = (_a = Record.Option) === null || _a === void 0 ? void 0 : _a.Transparent) !== null && _b !== void 0 ? _b : false;
                Record.Response = { Sections: [] };
                Record.RequestTimestamp = Date.now();
                console.log(Record);
                // Do the request
                return new Promise((Resolve, Reject) => {
                    var Section = { Content: "" };
                    var Client = new SSEClient("http://localhost:3000/request", "", Record);
                    // Send the request
                    Client.Listen((Data) => {
                        var _a;
                        try {
                            var Update = JSON.parse(Data.data);
                            // console.log(Update);
                        }
                        catch (Exception) {
                            console.log("Error: " + Data.data);
                            return;
                        }
                        // Handle the update
                        switch (Update.Type) {
                            case ChatResponseType.ServerError:
                                Reject(Update.Content);
                                Client.Close();
                                return;
                            case ChatResponseType.Start:
                                if (Update.Content) {
                                    Record.ID = Update.Content;
                                    Record.ThreadID = Update.Optional;
                                    Thread.ID = Update.Optional;
                                }
                                else if (Update.Optional) {
                                    Record.Language = Update.Optional;
                                    Thread.Language = Update.Optional;
                                }
                                return;
                            case ChatResponseType.Finish:
                                if (Section.Type !== undefined) {
                                    Record.Response.Sections.push(Section);
                                    Thread.Records[Record.ID] = Record;
                                    FinishSection(Section);
                                }
                                Record.ResponseTimestamp = Date.now();
                                Resolve(Record);
                                return;
                            case undefined:
                                break;
                            default:
                                if (Section.Type !== undefined) {
                                    Record.Response.Sections.push(Section);
                                    FinishSection(Section);
                                }
                                Section = Update;
                                Section.Options = (_a = Section.Options) !== null && _a !== void 0 ? _a : [];
                                NewSection(Section);
                                return;
                        }
                        // Update the section
                        Section.Content += Update.Content;
                        if (Update.Optional !== undefined)
                            Section.Optional = Update.Optional;
                        if (Update.Summary !== undefined)
                            Section.Summary = Update.Summary;
                        if (Update.Options !== undefined)
                            Section.Options.push(...Update.Options);
                        UpdateSection(Section);
                    }, (Error) => {
                        console.log("Server Error: " + Error);
                        Reject(Error);
                    });
                });
            });
        }
    }

    /** ChatRole: The role of the speaker. */
    var ChatRole;
    (function (ChatRole) {
        /** System: The system. */
        ChatRole["System"] = "system";
        /** User: The user. */
        ChatRole["User"] = "user";
        /** Assistant: The assistant. */
        ChatRole["Assistant"] = "assistant";
    })(ChatRole || (ChatRole = {}));

    /** ContextMessage: How to segment a message for the context. */
    var ContextMessage;
    (function (ContextMessage) {
        /** Nothing: Nothing should be retained. */
        ContextMessage[ContextMessage["Nothing"] = 0] = "Nothing";
        /** Section: Only the current section should be retained. */
        ContextMessage[ContextMessage["Section"] = 1] = "Section";
        /** EntireMessage: The entire message should be retained. */
        ContextMessage[ContextMessage["EntireMessage"] = 2] = "EntireMessage";
    })(ContextMessage || (ContextMessage = {}));
    /** ContextInheritance: How to inherit the parent context. */
    var ContextInheritance;
    (function (ContextInheritance) {
        /** Drop: Drop the context. */
        ContextInheritance[ContextInheritance["Drop"] = 0] = "Drop";
        /** InheritOne: Only inherit the current message segment. */
        ContextInheritance[ContextInheritance["InheritOne"] = 1] = "InheritOne";
        /** InheritParent: Only inherit the current message segment and its parent context. */
        ContextInheritance[ContextInheritance["InheritParent"] = 2] = "InheritParent";
        /** InheritRecursive: Inherit the current message segment and its parent context, recursively based on the parent's strategy. */
        ContextInheritance[ContextInheritance["InheritRecursive"] = 3] = "InheritRecursive";
        /** InheritEntire: Inherit the entire context. */
        ContextInheritance[ContextInheritance["InheritEntire"] = 4] = "InheritEntire";
    })(ContextInheritance || (ContextInheritance = {}));

    /** ChatManager: The interface for connecting to a chat backend. */
    class ChatManager {
        /** Reset: Reset the chat interface. */
        Reset() {
            this.Thread = new ChatThread();
            this.PendingRequest = null;
        }
        /** SendMessage: Send a direct message to the chat backend. */
        SendMessage(Content) {
            var _a;
            this.PendingRequest = (_a = this.PendingRequest) !== null && _a !== void 0 ? _a : { Input: "" };
            this.PendingRequest.Input = Content;
            this.PendingRequest.Language = this.Thread.Language;
            this.SendRequest(this.PendingRequest);
            this.PendingRequest = null;
        }
        /** SendRequest: Send a request to the chat backend and handle its outputs. */
        SendRequest(Request) {
            this.Commands.HideInput();
            this.Commands.ClearInput();
            // Make it a record and put it in the thread
            var Record = Request;
            var Subthread = this.Thread.AddToSubthread(Record);
            var Renderer = this.Outputs.RenderRecord(Record, Subthread);
            var CurrentRenderer;
            // Send the request
            var Options = 0;
            ChatNetwork.SendRequest(Record, this.Thread, (Section) => {
                var _a;
                // Create the section
                Subthread.RootID = (_a = Subthread.RootID) !== null && _a !== void 0 ? _a : Record.ID;
                CurrentRenderer = Renderer.AddSection(Section);
                this.Outputs.ScrollToBottom();
            }, (Section) => {
                // Update the section
                CurrentRenderer.SetData(Section);
                CurrentRenderer.Render();
                this.Outputs.ScrollToBottom();
            }, (Section) => {
                var _a, _b;
                console.log(Section);
                // Finish the section
                Options += (_b = (_a = Section.Options) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
                CurrentRenderer.SetFinalized();
                CurrentRenderer.SetData(Section);
                CurrentRenderer.Render();
                this.Outputs.ScrollToBottom();
            }).then((Record) => {
                if (Options == 0)
                    this.Commands.ShowInput();
                console.log(Record);
            }).catch((Error) => {
                if (!this.Commands.Disabled)
                    return;
                var Output = this.Outputs.PrintOutput(EditorLocalized.Get("Connection to server failed _", Error ?? "Unknown"), "RuntimeError");
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
        RequestOption(Option, Section, Record) {
            var _a;
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
                var RealChild = Record;
                var RealParent = Record;
                var RealSection = Section;
                // If the option is transparent, find the first could-be-transparent parent
                // Otherwise, find the first non-transparent parent
                while ((RealParent === null || RealParent === void 0 ? void 0 : RealParent.Transparent) === true) {
                    RealParent = this.Thread.GetRecord(RealParent.ParentID);
                    if (!RealParent) {
                        RealSection = undefined;
                        break;
                    }
                    else {
                        RealSection = RealParent.Response.Sections[RealChild.SectionIndex];
                        RealChild = RealParent;
                    }
                }
                // Inherit the context
                if (RealParent && RealSection) {
                    this.PendingRequest.ParentID = RealParent === null || RealParent === void 0 ? void 0 : RealParent.ID;
                    this.PendingRequest.SectionIndex = RealSection === null || RealSection === void 0 ? void 0 : RealSection.Index;
                    this.InheritContext(Option, RealSection, RealParent, -1);
                    if ((_a = Option.InputInContext) !== null && _a !== void 0 ? _a : true)
                        this.PendingRequest.Context.PreviousMessages.shift();
                }
            }
            // Send request or unlock the input
            if (Option.AskInput) {
                this.Commands.ShowInput();
            }
            else {
                this.SendRequest(this.PendingRequest);
            }
        }
        /** InheritContext: Inherit the context from the previous request. */
        InheritContext(Option, Section, Record, Layers = -1) {
            var _a, _b, _c;
            Option = Option !== null && Option !== void 0 ? Option : { Inheritance: ContextInheritance.InheritOne, Label: "" };
            var Context = this.PendingRequest.Context;
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
            this.PendingRequest.Operation = (_a = this.PendingRequest.Operation) !== null && _a !== void 0 ? _a : Record.Operation;
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
            if ((_b = Option.InputInContext) !== null && _b !== void 0 ? _b : true)
                Context.PreviousMessages.unshift({
                    Text: Record.Input,
                    Role: ChatRole.User
                });
            // Inherit the last code message (from new to old)
            if (((_c = Option.CodeInContext) !== null && _c !== void 0 ? _c : true) === true && Context.CodeSnippet === undefined) {
                var Code = Record.Response.Sections.find(Section => Section.Type == ChatResponseType.Code);
                if (Code != null)
                    Context.CodeSnippet = Code.Content;
            }
            // Inherit previous messages
            if (Layers == -2 || !Record.ParentID)
                return;
            // Find the parent
            var Parent = this.Thread.GetRecord(Record.ParentID);
            if (Parent == null)
                return;
            var ParentSection = Parent.Response.Sections[Record.SectionIndex];
            if (ParentSection == null)
                return;
            if (Layers == 0)
                Layers = -2; // Stop after the parent
            // Inherit the parent
            this.InheritContext(Parent.Option, ParentSection, Parent, Layers);
        }
        /** Constructor: Create a chat interface. */
        constructor(Tab) {
            // #region " Chat Requesting "
            /** Thread: The current chat thread. */
            this.Thread = new ChatThread();
            /** PendingRequest: The pending chat request. */
            this.PendingRequest = null;
            /** Available: Whether the chat backend is available. */
            this.Available = true;
            this.Commands = Tab;
            this.Outputs = Tab.Outputs;
            this.Reset();
            ChatManager.Instance = this;
        }
        // #endregion
        // #region " Message Rendering "
        /** OptionHandler: Handling an option. */
        OptionHandler(OptionElement) {
            var Option = OptionElement.data("option");
            var Section = OptionElement.parents(".chat-section").data("section");
            var Record = OptionElement.parents(".chat-response").data("record");
            this.RequestOption(Option, Section, Record);
        }
    }
    /** ThinkProcess: Whether to demonstrate the thinking processes. */
    ChatManager.ThinkProcess = false;

    /** OptionRenderer: A block that displays the a chat option. */
    class OptionRenderer extends UIRendererOf {
        /** ContainerInitializer: The initializer for the container. */
        ContainerInitializer() {
            var Container = $(`<li class="option"><a href="javascript:void(0)"></a></li>`);
            Container.on("click", () => this.ClickHandler());
            return Container;
        }
        /** RenderInternal: Render the UI element. */
        RenderInternal() {
            var _a, _b;
            this.Container.addClass((_a = this.GetData().Style) !== null && _a !== void 0 ? _a : "generated").children("a")
                .text((_b = this.GetData().LocalizedLabel) !== null && _b !== void 0 ? _b : this.GetData().Label);
        }
        /** ClickHandler: The handler for the click event. */
        ClickHandler() {
            var Section = this.Parent;
            var Record = Section.Parent;
            ChatManager.Instance.RequestOption(this.GetData(), Section.GetData(), Record.GetData());
        }
    }

    /** SectionRenderer: A block that displays the a response section. */
    class SectionRenderer extends UIRendererOf {
        /** SetFirst: Set the first status of the section. */
        SetFirst() {
            this.First = true;
            return this;
        }
        /** SetFinalized: Set the finalized status of the section. */
        SetFinalized() {
            this.Finalized = true;
            return this;
        }
        /** Constructor: Create a new UI renderer. */
        constructor() {
            super();
            /** First: Whether the section is the first one. */
            this.First = false;
            /** Finalized: Whether the section is finalized. */
            this.Finalized = false;
            this.Container.addClass("section");
            this.ContentContainer = $(`<p></p>`).appendTo(this.Container);
        }
        /** RenderInternal: Render the UI element. */
        RenderInternal() {
            this.ContentContainer.text(this.GetData().Content);
            this.RenderOptions();
        }
        /** RenderOptions: Render the options of the section. */
        RenderOptions() {
            var _a;
            var Options = this.GetData().Options;
            if (!Options || Options.length == 0)
                return;
            // Create the container
            this.OptionContainer = (_a = this.OptionContainer) !== null && _a !== void 0 ? _a : $(`<ul></ul>`).appendTo(this.Container);
            // Render the options
            for (var I = 0; I < Options.length; I++) {
                var Option = Options[I];
                var Renderer;
                if (this.Children.length <= I) {
                    Renderer = new OptionRenderer();
                    this.AddChild(Renderer, false);
                    this.OptionContainer.append(Renderer.Container);
                }
                else
                    Renderer = this.Children[I];
                Renderer.SetData(Option);
                Renderer.Render();
            }
        }
    }

    /** CodeSectionRenderer: A block that displays the a code response section. */
    class CodeSectionRenderer extends SectionRenderer {
        /** Constructor: Create a new UI renderer. */
        constructor() {
            super();
            this.Container.addClass("code");
        }
        /** RenderInternal: Render the UI element. */
        RenderInternal() {
            var Section = this.GetData();
            var Code = Section.Content.trim();
            // Remove the first line
            var LineBreak = Code.indexOf("\n");
            if (LineBreak == -1)
                return;
            Code = Code.substring(LineBreak + 1);
            // Remove the last ```
            if (Code.endsWith("```"))
                Code = Code.substring(0, Code.length - 3).trimEnd();
            // Create the code block
            if (this.Finalized) {
                this.ContentContainer = this.ContentContainer.replaceWith(`<code></code>`);
                ChatManager.Instance.Commands.AnnotateCode(this.ContentContainer, Code, true);
            }
            else {
                this.ContentContainer = this.ContentContainer.replaceWith(`<pre></pre>`).text(Code.trim());
            }
            this.RenderOptions();
        }
    }

    /** TextSectionRenderer: A block that displays the a text response section. */
    class TextSectionRenderer extends SectionRenderer {
        /** Constructor: Create a new UI renderer. */
        constructor() {
            super();
            this.Container.addClass("text");
        }
        /** RenderInternal: Render the UI element. */
        RenderInternal() {
            var _a, _b;
            var Section = this.GetData();
            var Content = Section.Content;
            // Filter the thinking process
            if (!ChatManager.ThinkProcess &&
                (Content.startsWith("Parameters:") || Content.startsWith("Thoughts:") || Content.startsWith("Input:"))) {
                var OutputIndex = Content.indexOf("\nOutput:");
                if (OutputIndex == -1) {
                    if (!this.Finalized)
                        Content = EditorLocalized.Get("I am planning for the answer...");
                    else
                        Content = "";
                }
                else
                    Content = Content.substring(OutputIndex + 8).trim();
            }
            // Filter the "output:"
            if (Content.startsWith("Output: "))
                Content = Content.substring(8).trim();
            // Render the text
            this.ContentContainer.text(Content);
            this.RenderOptions();
            // Remove the section if it's empty
            if (Content == "" && ((_b = (_a = Section.Options) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) == 0 && this.Finalized)
                this.Container.remove();
        }
    }

    /** InputRenderer: A block that displays the an user input. */
    class InputRenderer extends UIRendererOf {
        /** Constructor: Create a new UI renderer. */
        constructor() {
            super();
            this.Container.addClass("input");
            this.Container.html(`
<div class="avatar"><img src="images/user.png" /></div>
<div class="content"></div>`);
            this.Avatar = this.Container.find(".avatar");
            this.Content = this.Container.find(".content");
        }
        /** RenderInternal: Render the UI element. */
        RenderInternal() {
            this.Content.text(this.GetData().Input);
        }
    }

    /** RecordRenderer: A block that displays the output of a request. */
    class RecordRenderer extends UIRendererOf {
        /** Constructor: Create a new UI renderer. */
        constructor() {
            super();
            this.Container.addClass("record");
            this.InputRenderer = new InputRenderer();
            this.AddChild(this.InputRenderer);
            this.ContentContainer = $(`
<div class="contents">
    <div class="avatar"><img src="images/assistant.png" /></div>
    <div class="content"></div>
</div>`).appendTo(this.Container).find(".content");
        }
        /** RenderInternal: Render the UI element. */
        RenderInternal() { }
        /** SetData: Set the data of the renderer. */
        SetData(Data) {
            this.InputRenderer.SetData(Data);
            return super.SetData(Data);
        }
        /** AddSection: Add a section to the record. */
        AddSection(Section) {
            var Renderer;
            // Choose a renderer for the section
            var Renderers = SectionRenderers[Section.Type];
            for (var Chooser of Renderers) {
                Renderer = Chooser(Section);
                if (Renderer)
                    break;
            }
            // If no renderer was chosen, use the default renderer
            Renderer = Renderer !== null && Renderer !== void 0 ? Renderer : new SectionRenderer();
            // If this is the first section
            if (this.Children.length == 1)
                Renderer.SetFirst();
            // Add the renderer
            Renderer.SetData(Section);
            this.AddChild(Renderer, false);
            this.ContentContainer.append(Renderer.Container);
            return Renderer;
        }
    }
    /** SectionRenderers: The renderers for each section type. */
    const SectionRenderers = {
        [ChatResponseType.Start]: [],
        [ChatResponseType.Finish]: [],
        [ChatResponseType.Text]: [() => new TextSectionRenderer()],
        [ChatResponseType.Code]: [() => new CodeSectionRenderer()],
        [ChatResponseType.JSON]: [],
        [ChatResponseType.CompileError]: [],
        [ChatResponseType.RuntimeError]: [],
        [ChatResponseType.ServerError]: []
    };

    /** SubthreadRenderer: A block that displays the output of a subthread. */
    class SubthreadRenderer extends UIRendererOf {
        /** Constructor: Create a new UI renderer. */
        constructor() {
            super();
            this.Container.addClass("subthread");
        }
        /** RenderInternal: Render the UI element. */
        RenderInternal() { }
        /** AddRecord: Add a record to the subthread. */
        AddRecord(Record) {
            var Renderer = new RecordRenderer();
            Renderer.SetData(Record);
            this.AddChild(Renderer);
            return Renderer;
        }
    }

    /** OutputDisplay: Display the output section. */
    class OutputDisplay {
        /** Constructor: Create a new output section. */
        constructor(Tab) {
            /** Subthreads: The subthread store. */
            this.Subthreads = new Map();
            // #endregion
            // #region "Batch Printing Support"
            /** Fragment: Batch printing support for batch printing. */
            this.Fragment = null;
            /** BufferSize: Buffer size for batch printing. */
            this.BufferSize = 1000;
            this.Tab = Tab;
            this.Container = $(Tab.Container).find(".command-output");
        }
        /** ScrollToBottom: After user entered input, screen view should scroll down to the bottom line. */
        ScrollToBottom() {
            this.Container.scrollTop(this.Container.get(0).scrollHeight);
        }
        /** IsAtBottom: Whether the container is scrolled to bottom. */
        IsAtBottom() {
            var Element = this.Container.get(0);
            return Math.abs(Element.scrollHeight - Element.clientHeight - Element.scrollTop) < 1;
        }
        /** Clear: Clear the output region of Command Center. */
        Clear() {
            this.Container.remove();
            this.Subthreads.clear();
            delete this.Subthread;
        }
        /** RenderRecord: Render a new chat record. */
        RenderRecord(Record, Subthread) {
            var _a;
            var Renderer;
            // Create a new subthread if necessary
            if (Subthread != ((_a = this.Subthread) === null || _a === void 0 ? void 0 : _a.GetData())) {
                this.Subthread = this.Subthreads.get(Subthread);
                if (this.Subthread == null) {
                    this.Subthread = new SubthreadRenderer();
                    this.Container.append(this.Subthread.Container);
                    this.Subthread.SetData(Subthread);
                    this.Subthreads.set(Subthread, this.Subthread);
                }
                this.Subthread.SetStatus("active");
                this.ScrollToBottom();
            }
            // Render the record
            Renderer = this.Subthread.AddRecord(Record);
            this.Subthread.Render();
            return Renderer;
        }
        /** WriteOutput: Print to a batch. */
        WriteOutput(Element) {
            if (this.Fragment == null)
                this.Container.append(Element);
            else
                this.Fragment.append(Element);
        }
        /** OpenBatch: Open a printing batch. */
        OpenBatch() {
            this.Fragment = $(document.createDocumentFragment());
        }
        /** CloseBatch: Close a printing batch. */
        CloseBatch() {
            if (this.Fragment == null)
                return;
            var AtBottom = this.IsAtBottom();
            // Trim the buffer (should refactor later) & the display
            var Length = this.Fragment.children().length;
            if (Length > this.BufferSize) {
                this.Fragment.children().slice(0, Length - this.BufferSize).remove();
                this.Container.children().remove();
            }
            else {
                var NewLength = this.Container.children().length + Length;
                if (NewLength > this.BufferSize)
                    this.Container.children().slice(0, NewLength - this.BufferSize).remove();
            }
            // Append to the display
            this.Container.append(this.Fragment);
            this.Fragment = null;
            if (AtBottom)
                this.ScrollToBottom();
        }
        // #endregion
        // #region "Single Printing Support"
        /** PrintInput: Print a line of input to the screen. */
        PrintInput(Objective, Content, Embedded) {
            // Change the objective
            if (Objective == null)
                Objective = this.Tab.TargetSelect.val();
            else if (Objective != "assistant" && Objective != "you")
                this.Tab.TargetSelect.val(Objective);
            // CodeMirror Content
            var Wrapper = $(`
			<div class="command-wrapper">
				<div class="content">
					<p class="input Code">${Objective}&gt;&nbsp;<span></span></p>
				</div>
				<div class="icon">
					<img class="copy-icon" src="images/copy.png"/>
				</div>
			</div>
		`);
            // Standalone mode
            Wrapper.attr("objective", Objective);
            Wrapper.attr("content", Content);
            // Click to copy
            Wrapper.children(".icon").on("click", () => {
                this.Tab.SetCode(Wrapper.attr("objective"), Wrapper.attr("content"));
                this.Tab.Editor.Call({ Type: "ClipboardWrite", Content: `${Wrapper.attr("objective")}: ${Wrapper.attr("content")}` });
            });
            // Run CodeMirror
            this.Tab.AnnotateCode(Wrapper.children(".content").children(".Code").children("span"), Content, false);
            if (!Embedded)
                this.WriteOutput(Wrapper);
            return Wrapper;
        }
        /** PrintOutput: Provide for Unity to print compiled output. */
        PrintOutput(Content, Class) {
            var AtBottom = this.Fragment == null && this.IsAtBottom();
            var Output = null;
            switch (Class) {
                case "CompilationError":
                    Output = $(`
					<p class="CompilationError output">${Localized.Get("抱歉，未能理解你输入的命令")}: ${Content}</p>
				`);
                    break;
                case "RuntimeError":
                    Output = $(`<p class="RuntimeError output"></p>`);
                    Output.get(0).innerText = Localized.Get(Content);
                    break;
                case "Succeeded":
                    Output = $(`
					<p class="Succeeded output">${Localized.Get("成功执行了命令。")}</p>
				`);
                    break;
                case "Output":
                    Output = $(`<p class="Output output"></p>`);
                    Output.get(0).innerText = Content;
                    break;
                case "Help":
                    if (typeof Content === 'string') {
                        if (Content.indexOf("<div class=\"block\">") >= 0) {
                            Output = $(Content);
                        }
                        else {
                            Output = $(`
							<p class="${Class} output">${Content}</p>
						`);
                        }
                    }
                    else if (Content instanceof Array) {
                        Output = $(`
						<div class="block">
							${Content.map((Source) => `<p class="${Class} output">${Source}</p>`).join("")}
						</div>
					`);
                    }
                    else if (Content.Parameter == "-full") {
                        Output = $(`<p class="Output output">${Localized.Get("显示 {0} 的帮助信息。")
                        .replace("{0}", `<a class='command' target='help ${Content["display_name"]} -full'">${Content["display_name"]}</a>`)}</p>`);
                        this.Tab.ShowFullText(Content);
                    }
                    else {
                        Output = $(`
						<div class="block">
							<p class="${Class} output"><code>${Content["display_name"]}</code> - ${Content["agents"].map((Agent) => `${RenderAgent(Agent)}`).join(", ")}</p>
							<p class="${Class} output">${Content["short_description"]} (<a class='command' target='help ${Content["display_name"]} -full'">${Localized.Get("阅读全文")}</a>)</p>
							<p class="${Class} output">${Localized.Get("参见")}: ${Content["see_also"].map((Name) => `<a class='command' target='help ${Name}'>${Name}</a>`).join(", ")}</p>
						</div>
					`);
                    }
                    if (Output != null) {
                        LinkCommand(Output.find("a.command"));
                        this.AnnotateInput(Output.find("div.command"));
                        this.Tab.AnnotateCode(Output.find("code"));
                    }
                    break;
                default:
                    Output = $(`
					<p class="${Class} output">${Content}</p>
				`);
                    break;
            }
            this.WriteOutput(Output);
            if (AtBottom)
                this.ScrollToBottom();
            return Output;
        }
        /** AnnotateInput: Annotate some code inputs. */
        AnnotateInput(Query) {
            Query.each((Index, Item) => {
                var Current = $(Item);
                Current.replaceWith(this.PrintInput(Current.attr("objective"), Current.attr("target"), true));
            });
        }
    }

    /** CommandTab: A tab for the command center. */
    class CommandTab extends Tab {
        /** Show: Show the command tab.  */
        Show() {
            super.Show();
            bodyScrollLock.clearAllBodyScrollLocks();
            bodyScrollLock.disableBodyScroll(this.Outputs.Container.get(0));
            bodyScrollLock.disableBodyScroll(this.FullText.Container.get(0));
            this.HideFullText();
            this.Outputs.ScrollToBottom();
        }
        /** Hide: Hide the command tab. */
        Hide() {
            super.Hide();
            bodyScrollLock.clearAllBodyScrollLocks();
            bodyScrollLock.disableBodyScroll(document.querySelector('.cm-scroller'), { allowTouchMove: () => true });
            this.HideFullText();
        }
        /** Blur: Blur the tab's editor. */
        Blur() {
            super.Blur();
            this.Galapagos.Blur();
        }
        Resize(ViewportHeight, ScrollHeight) {
            super.Resize(ViewportHeight, ScrollHeight);
            this.Outputs.ScrollToBottom();
            return true;
        }
        /** Reset: Reset the command center. */
        Reset() {
            super.Reset();
            this.ShowInput();
            this.ClearInput();
            this.Outputs.Clear();
            this.ChatManager.Reset();
            this.HideFullText();
        }
        /** ShowFullText: Show the full-text help area. */
        ShowFullText(Data) {
            this.FullText.ShowFullText(Data);
            this.Outputs.Container.hide();
        }
        /** HideFullText: Hide the full-text help area. */
        HideFullText() {
            this.FullText.HideFullText();
            this.Outputs.Container.show();
            this.Outputs.ScrollToBottom();
        }
        /** Constructor: Initialize the command center. */
        constructor(Container, Editor) {
            super(Container, Editor);
            // #region "Foundational Interfaces"
            // Command center would be disabled before compile output come out.
            this.Disabled = false;
            /** CommandStack: Store the command history. */
            this.CommandStack = [];
            /** CurrentCommand: Store the current command. */
            this.CurrentCommand = [];
            /** CurrentCommandIndex: Store the current command index. */
            this.CurrentCommandIndex = 0;
            // Get the elements
            this.CommandLine = $(Container).find(".command-line");
            this.TargetSelect = this.CommandLine.find("select");
            // CodeMirror Editor
            this.Galapagos = new GalapagosEditor(this.CommandLine.find(".command-input").get(0), {
                OneLine: true,
                ParseMode: "Oneline",
                OnKeyUp: (Event) => this.InputKeyHandler(Event),
                OnDictionaryClick: (Text) => this.ExplainFull(Text)
            });
            // Set up sections
            this.Outputs = new OutputDisplay(this);
            this.FullText = new FullTextDisplay(this);
            this.ChatManager = new ChatManager(this);
        }
        /** InputKeyHandler: Handle the key input. */
        InputKeyHandler(Event) {
            const Key = Event.key;
            const Code = Event.code;
            // After press key `Enter`, excute command
            if (Key == "Enter" || Code == "Enter") {
                const Content = this.Galapagos.GetCode();
                this.Galapagos.CloseCompletion();
                if (!Content || this.Disabled)
                    return;
                const Objective = this.TargetSelect.val();
                if (TurtleEditor.PostMessage != null)
                    this.Disabled = true;
                this.HideFullText();
                this.SendCommand(Objective, Content);
            }
            // After press key `ArrowUp`, get previous command from command history
            else if (Key == "ArrowUp" || Code == "ArrowUp") {
                if (this.CurrentCommandIndex >= this.CommandStack.length)
                    return;
                this.CurrentCommandIndex += 1;
                const index = this.CommandStack.length - this.CurrentCommandIndex;
                this.SetCode(this.CommandStack[index][0], this.CommandStack[index][1]);
            }
            // After press key `ArrowDown`, get next command from command history
            else if (Key == "ArrowDown" || Code == "ArrowDown") {
                if (this.CurrentCommandIndex <= 1) {
                    this.CurrentCommandIndex = 0;
                    if (this.CurrentCommand.length == 0) {
                        this.ClearInput();
                    }
                    else {
                        this.SetCode(this.CurrentCommand[0], this.CurrentCommand[1]);
                    }
                    return;
                }
                const index = this.CommandStack.length - this.CurrentCommandIndex;
                this.SetCode(this.CommandStack[index][0], this.CommandStack[index][1]);
                this.CurrentCommandIndex -= 1;
            }
            else if (this.CurrentCommandIndex == 0) {
                const Content = this.Galapagos.GetCode();
                const Objective = this.TargetSelect.val();
                this.CurrentCommand = [Objective, Content];
                this.CurrentCommandIndex = 0;
            }
        }
        /** SendCommand: Send command to either execute or as a chat message. */
        SendCommand(Objective, Content) {
            return __awaiter(this, void 0, void 0, function* () {
                this.Outputs.ScrollToBottom();
                // Chatable or not
                var Chatable = this.ChatManager.Available;
                if (!Chatable) {
                    this.ExecuteInput(Objective, Content);
                    return;
                }
                // Check if it is a command
                if (Objective != "chat" && !/^[\d\.]+$/.test(Content)) {
                    // If there is no linting issues, assume it is code snippet
                    this.Galapagos.ForceParse();
                    let Diagnostics = yield this.Galapagos.ForceLintAsync();
                    let Mode = this.Galapagos.GetRecognizedMode();
                    if (Diagnostics.length == 0) {
                        if (Mode == "Reporter" || Mode == "Unknown")
                            Content = `show ${Content}`;
                        this.ExecuteInput(Objective, Content);
                        return;
                    }
                }
                // Otherwise, assume it is a chat message
                this.ChatManager.SendMessage(Content);
            });
        }
        /** ClearInput: Clear the input box of Command Center. */
        ClearInput() {
            this.Galapagos.SetCode("");
        }
        /** ShowInput: Show and enable the input box of Command Center. */
        ShowInput() {
            this.CommandLine.show();
            this.Disabled = false;
        }
        /** HideInput: Hide the input box of Command Center. */
        HideInput() {
            this.CommandLine.hide();
            this.Disabled = true;
        }
        // Set the content of command input.
        SetCode(Objective, Content) {
            this.TargetSelect.val(Objective.toLowerCase());
            this.Galapagos.SetCode(Content);
            setTimeout(() => this.Galapagos.SetCursorPosition(Content.length), 1);
        }
        /** AnnotateCode: Annotate some code snippets. */
        AnnotateCode(Target, Content, Copyable) {
            var This = this;
            for (var Item of Target.get()) {
                var Snippet = $(Item);
                // Render the code
                Content = Content ? Content : Item.innerText;
                var Output = this.Galapagos.Highlight(Content);
                Snippet.empty().append($(Output));
                // Copy support
                if (Copyable && Content.trim().indexOf(" ") >= 0 && Content.trim().indexOf("\n") == 0 && Snippet.parent("pre").length == 0)
                    Snippet.data("Code", Content).addClass("copyable").append($(`<img class="copy-icon" src="images/copy.png"/>`))
                        .on("click", function () {
                        This.SetCode("observer", $(this).data("Code"));
                    });
            }
        }
        // #endregion
        // #region "Command Execution"
        /** ExecuteInput: Execute a human-sent command. */
        ExecuteInput(Objective, Content) {
            // Record command history
            this.Outputs.PrintInput(Objective, Content, false);
            this.CommandStack.push([Objective, Content]);
            this.CurrentCommandIndex = 0;
            this.CurrentCommand = [];
            // Transform command
            switch (Objective.toLowerCase()) {
                case "turtles":
                    Content = `ask turtles [ ${Content} ]`;
                    break;
                case "patches":
                    Content = `ask patches [ ${Content} ]`;
                    break;
                case "links":
                    Content = `ask links [ ${Content} ]`;
                    break;
            }
            // Execute command
            this.Editor.Call({ Type: "CommandExecute", Source: Objective, Command: Content });
            this.ClearInput();
        }
        /** ExecuteCommand: Execute a command. */
        ExecuteCommand(Objective, Content) {
            this.Editor.Call({ Type: "CommandExecute", Source: Objective, Command: Content });
            this.Outputs.PrintInput(Objective, Content, false);
            this.Outputs.ScrollToBottom();
        }
        /** ExplainFull: ExplainFull: Explain the selected text in the command center in full. */
        ExplainFull(Command) {
            if (!EditorDictionary.Check(Command))
                return false;
            this.Outputs.ScrollToBottom();
            this.ExecuteCommand("observer", `help ${Command} -full`);
        }
        /** FinishExecution: Notify the completion of the command. */
        FinishExecution(Status, Message) {
            this.Outputs.PrintOutput(Message, Status);
            this.Disabled = false;
        }
    }

    /** ShowConfirm: Show a confirm dialog. */
    const ShowConfirm = function (Subject, Content, OK, Cancel) {
        $.confirm({
            title: Localized.Get(Subject),
            content: Localized.Get(Content),
            type: 'green',
            useBootstrap: false,
            buttons: {
                ok: {
                    text: Localized.Get("确定"),
                    btnClass: 'btn-primary',
                    keys: ['enter'],
                    action: OK
                },
                cancel: {
                    text: Localized.Get("取消"),
                    action: Cancel
                }
            }
        });
    };

    /** EditorTab: A tab for the code editor. */
    class EditorTab extends Tab {
        /** Show: Show the editor tab.  */
        Show() {
            super.Show();
            if (this.CodeRefreshed)
                this.Galapagos.SetCursorPosition(0);
        }
        /** Hide: Hide the editor tab.  */
        Hide() {
            super.Hide();
        }
        /** Blur: Blur the tab's editor. */
        Blur() {
            super.Blur();
            this.Galapagos.Blur();
        }
        Resize(ViewportHeight, ScrollHeight) {
            super.Resize(ViewportHeight, ScrollHeight);
            this.Galapagos.CodeMirror.requestMeasure();
            this.Galapagos.RefreshCursor();
            return true;
        }
        /** Constructor: Initialize the editor. */
        constructor(Container, Editor) {
            super(Container, Editor);
            this.IgnoreUpdate = false;
            /** CodeRefreshed: Did we refresh the code on the background? */
            this.CodeRefreshed = false;
            this.TipsElement = $(Container).children(".codemirror-tips");
            this.Galapagos = new GalapagosEditor($(Container).children(".codemirror").get(0), {
                Wrapping: true,
                OnUpdate: (Changed, Update) => {
                    if (Changed && !this.IgnoreUpdate)
                        this.Editor.Call({ Type: "CodeChanged" });
                },
                OnDictionaryClick: (Text) => this.Editor.CommandTab.ExplainFull(Text)
            });
        }
        // Show the tips
        ShowTips(Content, Callback) {
            if (!Callback)
                Callback = () => this.HideTips();
            this.TipsElement.off("click").text(Content).on("click", Callback).show();
        }
        // Hide the tips
        HideTips() {
            this.TipsElement.hide();
        }
        /** SetCompilerErrors: Show the compiler error linting messages. */
        SetCompilerErrors(Errors) {
            if (Errors.length == 0)
                this.HideTips();
            /** Temp hack: the Galapagos does not support unknown position errors yet. */
            if (Errors.length > 0 && Errors[0].start == 2147483647) {
                this.ShowTips(Errors[0].message);
                this.Galapagos.SetCompilerErrors([]);
            }
            else {
                if (Errors.length > 0) {
                    this.Galapagos.SetCursorPosition(Errors[0].start);
                }
                this.Galapagos.SetCompilerErrors(Errors);
            }
        }
        /** SetRuntimeErrors: Show the runtime error linting messages. */
        SetRuntimeErrors(Errors) {
            if (Errors.length > 0 && Errors[0].start == 2147483647) {
                this.ShowTips(Errors[0].message);
                this.Galapagos.SetRuntimeErrors([]);
            }
            else {
                if (Errors.length > 0) {
                    this.Galapagos.SetCursorPosition(Errors[0].start);
                }
                this.Galapagos.SetRuntimeErrors(Errors);
            }
        }
        /** SetCode: Set the content of the this. */
        SetCode(Content, Unapplied) {
            // Set the content
            if (Content != this.Galapagos.GetCode()) {
                this.IgnoreUpdate = true;
                this.Galapagos.ClearHistory();
                this.Galapagos.SetCode(Content);
                this.SetCompilerErrors([]);
                this.Galapagos.UpdateContext();
                if (!this.Visible)
                    this.CodeRefreshed = true;
                this.Galapagos.SetCursorPosition(0);
                this.HideTips();
                this.IgnoreUpdate = false;
            }
            // Mark clean or show tips
            if (!Unapplied)
                this.SetApplied();
        }
        /** GetCode: Get the content of the this. */
        GetCode() {
            return this.Galapagos.GetCode();
        }
        /** SetApplied: Set applied status. */
        SetApplied() {
            this.SetCompilerErrors([]);
        }
        // #endregion
        // #region "Editor Functionalities"
        /** JumpToNetTango: Jump to the NetTango portion. */
        JumpToNetTango() {
            var Index = this.GetCode().indexOf("; --- NETTANGO BEGIN ---");
            if (Index == -1)
                return;
            this.Galapagos.SetCursorPosition(Index);
        }
        /** ResetCode: Show the reset dialog. */
        ResetCode() {
            ShowConfirm("重置代码", "是否将代码重置到最后一次成功编译的状态？", () => this.Editor.Call({ Type: "CodeReset" }));
        }
        /** ShowMenu: Show a feature menu. */
        ShowMenu() {
            var Dialog = $("#Dialog-Procedures");
            var List = Dialog.children("ul").empty();
            Dialog.children("h4").text(Localized.Get("更多功能"));
            var Features = {};
            Features[Localized.Get("选择全部")] = () => this.Galapagos.SelectAll();
            Features[Localized.Get("撤销操作")] = () => this.Galapagos.Undo();
            Features[Localized.Get("重做操作")] = () => this.Galapagos.Redo();
            Features[Localized.Get("跳转到行")] = () => this.Galapagos.ShowJumpTo();
            Features[Localized.Get("整理代码")] = () => this.Galapagos.PrettifyAll();
            Features[Localized.Get("重置代码")] = () => this.ResetCode();
            for (var Feature in Features) {
                $(`<li>${Feature}</li>`).attr("Tag", Feature).appendTo(List).click(function () {
                    Features[$(this).attr("Tag")]();
                    $.modal.close();
                });
            }
            Dialog.modal({});
        }
        /** ShowProcedures: List all procedures in the code. */
        ShowProcedures() {
            var Procedures = this.GetProcedures();
            if (Object.keys(Procedures).length == 0) {
                this.Editor.Toast("warning", Localized.Get("代码中还没有任何子程序。"));
            }
            else {
                var Dialog = $("#Dialog-Procedures");
                var List = Dialog.children("ul").empty();
                Dialog.children("h4").text(Localized.Get("跳转到子程序"));
                var Handler = () => {
                    this.Galapagos.Select($(this).attr("start"), $(this).attr("end"));
                    $.modal.close();
                };
                for (var Procedure in Procedures) {
                    $(`<li>${Procedure}</li>`).appendTo(List)
                        .attr("start", Procedures[Procedure][0])
                        .attr("end", Procedures[Procedure][1]).click(Handler);
                }
                Dialog.modal({});
            }
        }
        /** GetProcedures: Get all procedures from the code. */
        GetProcedures() {
            var Rule = /^\s*(?:to|to-report)\s(?:\s*;.*\n)*\s*(\w\S*)/gm; // From NLW
            var Content = this.GetCode();
            var Names = {};
            var Match;
            while (Match = Rule.exec(Content)) {
                var Length = Match.index + Match[0].length;
                Names[Match[1]] = [Length - Match[1].length, Length];
            }
            return Names;
        }
    }

    /** TurtleEditor: The multi-tab code editor for Turtle Universe. */
    class TurtleEditor {
        /** Constructor: Constructor. */
        constructor(Container, PostMessage) {
            /** EditorTabs: The editor tabs. */
            this.EditorTabs = [];
            /** CurrentTab: The visible tab. */
            this.CurrentTab = null;
            /** Toast: Show a toast. */
            this.Toast = function (Type, Content, Subject) {
                toastr[Type](Content, Subject);
            };
            this.Container = Container;
            TurtleEditor.PostMessage = PostMessage;
            // Initialize the darkmode
            this.Darkmode = new Darkmode();
            // Initialize the tabs
            this.EditorTabs = [new EditorTab($(Container).children("div.editor").get(0), this)];
            this.CommandTab = new CommandTab($(Container).children("div.commands").get(0), this);
            this.CommandTab.Show();
            this.EditorTabs[0].Galapagos.AddChild(this.CommandTab.Galapagos);
            // Listen to the sizing
            if (window.visualViewport)
                window.visualViewport.addEventListener("resize", () => { var _a; return (_a = this.CurrentTab) === null || _a === void 0 ? void 0 : _a.SyncSize(); });
        }
        /** Call: Call the facilitator (by default, the Unity Engine). */
        Call(Message) {
            if (TurtleEditor.PostMessage)
                TurtleEditor.PostMessage(JSON.stringify(Message));
            else
                console.log(Message);
        }
        /** GetAllTabs: Get all tabs. */
        GetAllTabs() {
            return [this.CommandTab, ...this.EditorTabs];
        }
        /** HideAllTabs: Hide all tabs. */
        HideAllTabs() {
            this.GetAllTabs().forEach(Tab => Tab.Hide());
        }
        /** BlurAll: Blur all tabs. */
        BlurAll() {
            this.GetAllTabs().forEach(Tab => Tab.Blur());
        }
        // #endregion
        // #region "Editor Interfaces"
        /** GetContext: Get the NetLogo context. */
        GetContext() {
            var Galapagos = this.EditorTabs[0].Galapagos;
            Galapagos.ForceParse();
            var State = Galapagos.GetState();
            // Create the procedures map
            var Procedures = [];
            for (var [Name, Procedure] of State.Procedures) {
                Procedures.push({ Name: Name, Arguments: [...Procedure.Arguments], IsCommand: Procedure.IsCommand });
            }
            // Create the breeds map
            var Breeds = [];
            for (var [Name, Breed] of State.Breeds) {
                Breeds.push({ Singular: Breed.Singular, Plural: Breed.Plural, Variables: [...Breed.Variables], IsLinkBreed: Breed.IsLinkBreed });
            }
            return {
                Language: "NetLogo",
                Extensions: [...State.Extensions],
                Globals: [...State.Globals],
                WidgetGlobals: [...State.WidgetGlobals],
                Procedures: Procedures,
                Breeds: Breeds
            };
        }
        // #endregion
        // #region "Editor Statuses"
        /** Resize: Resize the viewport width (on mobile platforms) */
        Resize(Ratio) {
            $("body").addClass("Mobile");
            $("#viewport").attr("content", `width=device-width,initial-scale=${Ratio},maximum-scale=${Ratio},minimum-scale=${Ratio},user-scalable=no,viewport-fit=cover`);
        }
        /** ToggleDark: Toggle the dark mode. */
        ToggleDark(Status) {
            if (Status != this.Darkmode.isActivated())
                this.Darkmode.toggle();
        }
        /** SetPlatform: Set the platform of the editor. */
        SetPlatform(Platform) {
            $("body").addClass(Platform);
        }
        /** Reset: Reset the editor. */
        Reset() {
            this.CommandTab.Reset();
            this.EditorTabs.forEach(Tab => Tab.Reset());
        }
    }
    /** Export classes globally. */
    try {
        window.TurtleEditor = TurtleEditor;
        window.TurtleLocalized = Localized;
        window.RotateScreen = RotateScreen();
    }
    catch (error) { }

    exports.TurtleEditor = TurtleEditor;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
