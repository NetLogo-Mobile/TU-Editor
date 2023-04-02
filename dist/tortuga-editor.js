(function (exports) {
    'use strict';

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

    /** Tab: A tab in the code editor. */
    class Tab {
        /** Constructor: Create an editor tab. */
        constructor(Container, Editor) {
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
        }
        /** Blur: Blur the tab's editor. */
        Blur() {
        }
    }

    // TransformLinks: Transform the embedded links.
    function TransformLinks(Element) {
        if (TurtleEditor.PostMessage != null)
            return;
        Element.find("a").each((Index, Link) => {
            Link = $(Link);
            var Href = Link.attr("href");
            Link.attr("href", "javascript:void(0);");
            Link.on("click", function () { this.Call({ Type: "Visit", Target: Href }); });
        });
    }

    /** CommandTab: A tab for the command center. */
    class CommandTab extends Tab {
        // Show: Show the command tab. 
        Show() {
            super.Show();
            bodyScrollLock.clearAllBodyScrollLocks();
            bodyScrollLock.disableBodyScroll(this.Outputs.get(0));
            bodyScrollLock.disableBodyScroll(this.Fulltext.get(0));
            this.HideFullText();
        }
        // Hide: Hide the command tab.
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
        // Constructor: Initialize the command center.
        constructor(Container, Editor) {
            super(Container, Editor);
            // #region "Foundational Interfaces"
            // Command center would be disabled before compile output come out.
            this.Disabled = false;
            // Following three variables are used for command histrory.
            this.CommandStack = [];
            this.CurrentCommand = [];
            this.CurrentCommandIndex = 0;
            // Fragment: Batch printing support for batch printing.
            this.Fragment = null;
            // BufferSize: Buffer size for batch printing.
            this.BufferSize = 1000;
            // KeepSize: The number of messages that are kept forever. 
            this.KeepSize = -1;
            // RequestedTab: The tab that requested the full text.
            this.RequestedTab = null;
            // Get the elements
            this.Outputs = $(Container).find(".command-output");
            this.Fulltext = $(Container).find(".command-fulltext");
            this.CommandLine = $(Container).find(".command-line");
            this.TargetSelect = this.CommandLine.find("select");
            this.KeepSize = this.Outputs.children(".Keep").length;
            // CodeMirror Editor
            this.Galapagos = new GalapagosEditor(this.CommandLine.find(".command-input").get(0), {
                OneLine: true,
                OnKeyUp: (Event) => {
                    const Key = Event.key;
                    const Code = Event.code;
                    // After press key `Enter`, excute command
                    if (Key == "Enter" || Code == "Enter") {
                        const Content = this.Galapagos.GetCode();
                        this.ClearInput();
                        if (!Content || this.Disabled)
                            return;
                        const Objective = this.TargetSelect.val();
                        if (TurtleEditor.PostMessage != null)
                            this.Disabled = true;
                        this.Execute(Objective, Content);
                        this.CommandStack.push([Objective, Content]);
                        this.CurrentCommandIndex = 0;
                        this.CurrentCommand = [];
                        this.Galapagos.CloseCompletion();
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
                },
                OnDictionaryClick: (Text) => this.ExplainFull(Text)
            });
            // Annotate by default
            this.AnnotateCode(this.Outputs.find(".keep code"), null, true);
            // Listen to the sizing
            if (window.visualViewport)
                window.visualViewport.addEventListener("resize", () => {
                    if (navigator.userAgent.indexOf("Macintosh") == -1 && navigator.userAgent.indexOf("Mac OS X") == -1) {
                        var Height = window.visualViewport.height;
                        $(this.Editor.Container).css("height", `${Height}px`);
                    }
                    else {
                        setTimeout(() => this.Outputs.add(this.Fulltext)
                            .css("padding-top", `calc(0.5em + ${document.body.scrollHeight - window.visualViewport.height}px)`), 100);
                    }
                    if (this.Visible)
                        this.Outputs.scrollTop(100000);
                });
        }
        // Print to a batch.
        WriteOutput(Element) {
            if (this.Fragment == null)
                this.Outputs.append(Element);
            else
                this.Fragment.append(Element);
        }
        // Open a printing batch.
        OpenBatch() {
            this.Fragment = $(document.createDocumentFragment());
        }
        // Close a printing batch.
        CloseBatch() {
            if (this.Fragment == null)
                return;
            // Trim the buffer (should refactor later) & the display
            var Length = this.Fragment.children().length;
            if (Length > this.BufferSize) {
                this.Fragment.children().slice(0, Length - this.BufferSize).remove();
                this.Outputs.children().slice(this.KeepSize).remove();
            }
            else {
                var NewLength = this.Outputs.children().length - this.KeepSize + Length;
                if (NewLength > this.BufferSize)
                    this.Outputs.children().slice(this.KeepSize, NewLength - this.BufferSize + this.KeepSize).remove();
            }
            // Append to the display
            this.Outputs.append(this.Fragment);
            this.Fragment = null;
            this.ScrollToBottom();
        }
        // Print a line of input to the screen
        PrintInput(Objective, Content, Embedded) {
            if (Objective == null)
                Objective = this.TargetSelect.val();
            else
                this.TargetSelect.val(Objective);
            // CodeMirror Content
            var Wrapper = $(`
			<div class="command-wrapper">
				<div class="content">
					<p class="input Code">${Objective}&gt;<span></span></p>
				</div>
				<div class="icon">
					<img class="copy-icon" src="images/copy.png"/>
				</div>
			</div>
		`);
            if (!Embedded)
                this.WriteOutput(Wrapper);
            Wrapper.attr("objective", Objective);
            Wrapper.attr("content", Content);
            // Click to copy
            Wrapper.children(".icon").on("click", () => {
                this.SetCode(Wrapper.attr("objective"), Wrapper.attr("content"));
                this.Editor.Call({ Type: "ClipboardWrite", Content: `${Wrapper.attr("objective")}: ${Wrapper.attr("content")}` });
            });
            // Run CodeMirror
            this.AnnotateCode(Wrapper.children(".content").children(".Code").children("span"), Content, false);
            return Wrapper;
        }
        // Provide for Unity to print compiled output
        PrintOutput(Content, Class) {
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
                        this.ShowFullText(Content);
                    }
                    else {
                        Output = $(`
						<div class="block">
							<p class="${Class} output"><code>${Content["display_name"]}</code> - ${Content["agents"].map((Agent) => `${this.RenderAgent(Agent)}`).join(", ")}</p>
							<p class="${Class} output">${Content["short_description"]} (<a class='command' target='help ${Content["display_name"]} -full'">${Localized.Get("阅读全文")}</a>)</p>
							<p class="${Class} output">${Localized.Get("参见")}: ${Content["see_also"].map((Name) => `<a class='command' target='help ${Name}'>${Name}</a>`).join(", ")}</p>
						</div>
					`);
                    }
                    if (Output != null) {
                        this.LinkCommand(Output.find("a.command"));
                        this.AnnotateInput(Output.find("div.command"));
                        this.AnnotateCode(Output.find("code"));
                    }
                    break;
                default:
                    Output = $(`
					<p class="${Class} output">${Content}</p>
				`);
                    break;
            }
            this.WriteOutput(Output);
            if (this.Fragment == null)
                this.ScrollToBottom();
        }
        /* Rendering stuff */
        // Annotate some code snippets.
        AnnotateCode(Target, Content, Copyable) {
            for (var Item of Target.get()) {
                var Snippet = $(Item);
                // Render the code
                var Output = this.Galapagos.Highlight(Content ? Content : Item.innerText);
                Snippet.empty().append($(Output));
                // Copy support
                if (Copyable && Item.innerText.trim().indexOf(" ") >= 0 && Snippet.parent("pre").length == 0)
                    Snippet.addClass("copyable").append($(`<img class="copy-icon" src="images/copy.png"/>`)).on("click", () => {
                        this.SetCode("observer", Snippet.text());
                    });
            }
        }
        // Annotate some code inputs.
        AnnotateInput(Query) {
            Query.each((Index, Item) => {
                Item = $(Item);
                Item.replaceWith(this.PrintInput(Item.attr("objective"), Item.attr("target"), true));
            });
        }
        // Generate a link for another command.
        LinkCommand(Query) {
            Query.each((Index, Item) => {
                Item = $(Item);
                var Target = Item.attr("target");
                if (Target == null)
                    Target = Item.text();
                var Objective = Item.attr("objective");
                if (!Objective)
                    Objective = "null";
                Item.attr("href", "javascript:void(0)");
                Item.attr("onclick", `this.Execute(${Objective}, '${Target}')`);
            });
            return Query;
        }
        // Render tips for an agent type.
        RenderAgent(Agent) {
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
        // Clear the input box of Command Center
        ClearInput() {
            this.Galapagos.SetCode("");
        }
        // Clear the output region of Command Center
        ClearOutput() {
            this.Outputs.children().slice(this.KeepSize).remove();
        }
        // After user entered input, screen view should scroll down to the botom line
        ScrollToBottom() {
            this.Outputs.scrollTop(this.Outputs.get(0).scrollHeight);
        }
        // Execute a command from the user
        Execute(Objective, Content) {
            this.Editor.Call({ Type: "CommandExecute", Source: Objective, Command: Content });
            this.PrintInput(Objective, Content, false);
            this.ScrollToBottom();
        }
        // Set the content of command input
        SetCode(Objective, Content) {
            this.TargetSelect.val(Objective.toLowerCase());
            this.Galapagos.SetCode(Content);
            setTimeout(() => this.Galapagos.SetCursorPosition(Content.length), 1);
        }
        // Provide for Unity to notify completion of the command
        FinishExecution(Status, Message) {
            this.HideFullText();
            this.PrintOutput(Message, Status);
            this.Disabled = false;
        }
        // Show the full text of a command.
        ShowFullText(Data) {
            this.RequestedTab = this.Editor.CurrentTab;
            if (!this.Visible)
                this.Show();
            // Change the status
            this.Fulltext.show();
            this.Outputs.hide();
            // Render the subject
            this.Fulltext.find("h2 strong").text(Data["display_name"]);
            this.Fulltext.find("h2 span").text(`(${Data["agents"].map((Agent) => `${this.RenderAgent(Agent)}`).join(", ")})`);
            // Render the list
            var SeeAlso = this.Fulltext.find("ul.SeeAlso").empty();
            for (var Primitive in Data["see_also"])
                this.LinkCommand($(`<li><a class="command" target="help ${Primitive}">${Primitive}</a> - ${Data["see_also"][Primitive]}</li>`).appendTo(SeeAlso).find("a"));
            // Machine-translation
            var Translator = this.Fulltext.find(".translator");
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
                    this.Fulltext.find("div.fulltext")
                        .html(new showdown.Converter().makeHtml(Content));
                this.AnnotateCode(this.Fulltext.find("code"), null, true);
                this.Fulltext.scrollTop(0);
            };
            SetCode(Data["translation"] != null ? Data["translation"] : Data["content"]);
            // Acknowledge
            TransformLinks(this.Fulltext.find(".Acknowledge").html(Data["acknowledge"]));
        }
        // Hide the full text mode.
        HideFullText() {
            var _a;
            if (!this.Fulltext.is(":visible"))
                return;
            this.Fulltext.hide();
            this.Outputs.show();
            this.ScrollToBottom();
            (_a = this.RequestedTab) === null || _a === void 0 ? void 0 : _a.Show();
        }
        // ExplainFull: Explain the selected text in the command center in full.
        ExplainFull(Command) {
            if (!EditorDictionary.Check(Command))
                return false;
            this.ScrollToBottom();
            this.Execute("observer", `help ${Command} -full`);
        }
    }

    // ShowConfirm: Show a confirm dialog.
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

    /** EditorTab: A tab for the code this. */
    class EditorTab extends Tab {
        // Show: Show the editor tab. 
        Show() {
            super.Show();
            // if (this.CodeRefreshed) this.Galapagos.SetCursorPosition(0);
        }
        // Hide: Hide the editor tab. 
        Hide() {
            super.Hide();
        }
        /** Blur: Blur the tab's editor. */
        Blur() {
            super.Blur();
            this.Galapagos.Blur();
        }
        // Constructor: Initialize the editor.
        constructor(Container, Editor) {
            super(Container, Editor);
            // Show the tips
            this.ShowTips = function (Content, Callback) {
                if (!Callback)
                    Callback = () => { this.HideTips(); };
                this.TipsElement.off("click").text(Content).on("click", Callback).show();
            };
            // Hide the tips
            this.HideTips = function () {
                this.TipsElement.hide();
            };
            // Editor support
            this.IgnoreUpdate = false;
            // CodeRefreshed: Did we refresh the code on the background?
            this.CodeRefreshed = false;
            // ShowProcedures: List all procedures in the code.
            this.ShowProcedures = function () {
                var Procedures = this.GetProcedures();
                if (Object.keys(Procedures).length == 0) {
                    this.Toast("warning", Localized.Get("代码中还没有任何子程序。"));
                }
                else {
                    var Dialog = $("#Dialog-Procedures");
                    var List = Dialog.children("ul").empty();
                    Dialog.children("h4").text(Localized.Get("跳转到子程序"));
                    var Handler = function () {
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
            };
            // GetProcedures: Get all procedures from the code.
            this.GetProcedures = function () {
                var Rule = /^\s*(?:to|to-report)\s(?:\s*;.*\n)*\s*(\w\S*)/gm; // From NLW
                var Content = this.GetCode();
                var Names = [];
                var Match;
                while (Match = Rule.exec(Content)) {
                    var Length = Match.index + Match[0].length;
                    Names[Match[1]] = [Length - Match[1].length, Length];
                }
                return Names;
            };
            this.TipsElement = $(Container).children(".codemirror-tips");
            this.Galapagos = new GalapagosEditor($(Container).children(".codemirror").get(0), {
                Wrapping: true,
                OnUpdate: (Changed, Update) => {
                    if (Changed && !this.IgnoreUpdate) {
                        this.Editor.Call({ Type: "CodeChanged" });
                    }
                },
                OnDictionaryClick: (Text) => this.Editor.CommandTab.ExplainFull(Text)
            });
        }
        // SetCompilerErrors: Show the compiler error linting messages.
        SetCompilerErrors(Errors) {
            if (Errors.length == 0)
                this.HideTips();
            // Temp hack: the Galapagos does not support unknown position errors yet.
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
        // SetRuntimeErrors: Show the runtime error linting messages.
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
        // SetCode: Set the content of the this.
        SetCode(Content, Unapplied) {
            // Set the content
            if (Content != this.Galapagos.GetCode()) {
                this.IgnoreUpdate = true;
                this.SetCompilerErrors([]);
                this.Galapagos.ClearHistory();
                this.Galapagos.SetCode(Content);
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
        // GetCode: Get the content of the this.
        GetCode() {
            return this.Galapagos.GetCode();
        }
        // SetApplied: Set applied status.
        SetApplied() {
            // Generation = this.Galapagos.doc.changeGeneration();
            this.HideTips();
        }
        // JumpToNetTango: Jump to the NetTango portion.
        JumpToNetTango() {
            var Index = this.GetCode().indexOf("; --- NETTANGO BEGIN ---");
            if (Index == -1)
                return;
            this.Galapagos.SetCursorPosition(Index);
        }
        // Reset: Show the reset dialog.
        Reset() {
            ShowConfirm("重置代码", "是否将代码重置到最后一次成功编译的状态？", () => this.Editor.Call({ Type: "CodeReset" }));
        }
        // ShowMenu: Show a feature menu.
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
            Features[Localized.Get("重置代码")] = () => this.Reset();
            for (var Feature in Features) {
                $(`<li>${Feature}</li>`).attr("Tag", Feature).appendTo(List).click(function () {
                    Features[$(this).attr("Tag")]();
                    $.modal.close();
                });
            }
            Dialog.modal({});
        }
    }

    /** TurtleEditor: The multi-tab code editor for Turtle Universe. */
    class TurtleEditor {
        /** Constructor: Constructor. */
        constructor(Container, PostMessage) {
            /** EditorTabs: The editor tabs. */
            this.EditorTabs = [];
            // Toast: Show a toast.
            this.Toast = function (Type, Content, Subject) {
                toastr[Type](Content, Subject);
            };
            this.Container = Container;
            TurtleEditor.PostMessage = PostMessage;
            this.CommandTab = new CommandTab($(Container).children("div.command").get(0), this);
            this.EditorTabs = [new EditorTab($(Container).children("div.editor").get(0), this)];
            this.CommandTab.Show();
            this.CommandTab.ScrollToBottom();
            this.Darkmode = new Darkmode();
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
        // #region "Editor Statuses"
        // Resize: Resize the viewport width (on mobile platforms)
        Resize(Ratio) {
            $("body").addClass("Mobile");
            $("#viewport").attr("content", `width=device-width,initial-scale=${Ratio},maximum-scale=${Ratio},minimum-scale=${Ratio},user-scalable=no,viewport-fit=cover`);
        }
        // SetDesktop: Set the desktop mode.
        SetFontsize(Status) {
            $("html").css("font-size", Status + "px");
        }
        // ToggleDark: Toggle the dark mode.
        ToggleDark(Status) {
            if (Status != this.Darkmode.isActivated())
                this.Darkmode.toggle();
        }
        // SetPlatform: Set the platform of the editor.
        SetPlatform(Platform) {
            $("body").addClass(Platform);
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
