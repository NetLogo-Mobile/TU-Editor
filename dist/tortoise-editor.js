// Editor: Handle the interaction of CodeMirror main editor.
// REFACTOR NEEDED IF WE ARE GOING TO SUPPORT MORE STATUSES
Editor = function() {
	var Editor = {};
	var Galapagos = null;
	var DarkMode = null;

	// UI support
	// Obseleted: Tips
	// Show the tips
	Editor.ShowTips = function(Content, Callback) {
		if (Callback == null) Callback = () => { Editor.HideTips(); };
		$("#Main-Tips").off("click").text(Content).click(Callback).show();
		TipsActive = true;
	}

	// Hide the tips
	Editor.HideTips = function() {
		$("#Main-Tips").hide();
		TipsActive = false;
	}

	// SetCompilerErrors: Show the compiler error linting messages.
	Editor.SetCompilerErrors = function(Errors) {
		if (Errors.length == 0) Editor.HideTips();
		// Temp hack: the Galapagos does not support unknown position errors yet.
		if (Errors.length > 0 && Errors[0].start == 2147483647) {
			Editor.ShowTips(Message.message);
			Galapagos.SetCompilerErrors([]);
		} else {
			if (Errors.length > 0) {
				Galapagos.SetCursorPosition(Errors[0].start);
			}
			Galapagos.SetCompilerErrors(Errors);
		}
	}

	// SetRuntimeErrors: Show the runtime error linting messages.
	Editor.SetRuntimeErrors = function(Errors) {
		if (Errors.length > 0 && Errors[0].start == 2147483647) {
			Editor.ShowTips(Message.message);
			Galapagos.SetRuntimeErrors([]);
		}else {
			if (Errors.length > 0) {
				Galapagos.SetCursorPosition(Errors[0].start);
			}
			Galapagos.SetRuntimeErrors(Errors);
		}
	}

	// Interface-related
	// ClearDialogs: Clear all dialogs.
	Editor.ClearDialogs = function() {
		var Dialog = $(".CodeMirror-dialog");
		return Dialog.remove();
	}

	// Toast: Show a toast.
	Editor.Toast = function(Type, Content, Subject) {
		toastr[Type](Content, Subject);
	}

	// Confirm: Show a confirm.
	Editor.Confirm = function(Subject, Content, OK, Cancel) {
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
	}

	// Editor support
	var IgnoreUpdate = false;
	// SetCode: Set the content of the editor.
	Editor.SetCode = function(Content, Unapplied) {
		// Set the content
		if (Content != Galapagos.GetCode()) {
			IgnoreUpdate = true;
			Editor.SetCompilerErrors([]);
			Galapagos.ClearHistory();
			Galapagos.SetCode(Content);
			Galapagos.SetCursorPosition(0);
			Editor.HideTips();
			IgnoreUpdate = false;
		}
		// Mark clean or show tips
		if (!Unapplied) Editor.SetApplied();
	}

	// Galapagos: Refers to the main editor.
	Editor.Galapagos = null;

	// GetCode: Get the content of the editor.
	Editor.GetCode = function(Finalizing) {
		if (Finalizing) {
			Galapagos.Blur();
			Commands.Galapagos.Blur();
		}
		return Galapagos.GetCode();
	}

	// SetApplied: Set applied status.
	Editor.SetApplied = function() {
		// Generation = Galapagos.doc.changeGeneration();
		Editor.HideTips();
	}

	// JumpToNetTango: Jump to the NetTango portion.
	Editor.JumpToNetTango = function() {
		var Index = Editor.GetCode().indexOf("; --- NETTANGO BEGIN ---");
		if (Index == -1) return;
		Galapagos.SetCursorPosition(Index);
	}
	
	// Reset: Show the reset dialog.
	Editor.Reset = function() {
		Editor.Confirm(Localized.Get("重置代码"), Localized.Get("是否将代码重置到最后一次成功编译的状态？"),
			() => Editor.Call({ Type: "CodeReset" }));
	}

	// ShowMenu: Show a feature menu.
	Editor.ShowMenu = function() {
		var Dialog = $("#Dialog-Procedures")
		var List = Dialog.children("ul").empty();
		Dialog.children("h4").text(Localized.Get("更多功能"));
		var Features = {};
		Features[Localized.Get("选择全部")] = Editor.Galapagos.SelectAll;
		Features[Localized.Get("撤销操作")] = Editor.Galapagos.Undo;
		Features[Localized.Get("重做操作")] = Editor.Galapagos.Redo;
		Features[Localized.Get("跳转到行")] = Editor.Galapagos.ShowJumpTo;
		Features[Localized.Get("重置代码")] = Editor.Reset;
		for (var Feature in Features) {
			$(`<li>${Feature}</li>`).attr("Tag", Feature).appendTo(List).click(function() {
				Features[$(this).attr("Tag")]();
				$.modal.close();
			});
		}
		$("#Dialog-Procedures").modal({});
	}

	// ShowProcedures: List all procedures in the code.
	Editor.ShowProcedures = function() {
		var Procedures = Editor.GetProcedures();
		if (Object.keys(Procedures).length == 0) {
			Editor.Toast("warning", Localized.Get("代码中还没有任何子程序。"));
		} else {
			var Dialog = $("#Dialog-Procedures")
			var List = Dialog.children("ul").empty();
			Dialog.children("h4").text(Localized.Get("跳转到子程序"));
			var Handler = function() {
				Galapagos.Select($(this).attr("start"), $(this).attr("end"));
				$.modal.close();
			};
			for (var Procedure in Procedures) {
				$(`<li>${Procedure}</li>`).appendTo(List)
					.attr("start", Procedures[Procedure][0])
					.attr("end", Procedures[Procedure][1]).click(Handler);
			}
			$("#Dialog-Procedures").modal({});
		}
	}

	// GetProcedures: Get all procedures from the code.
	Editor.GetProcedures = function() {
		var Rule = /^\s*(?:to|to-report)\s(?:\s*;.*\n)*\s*(\w\S*)/gm // From NLW
		var Content = Editor.GetCode(); var Names = [];
		while (Match = Rule.exec(Content)) {
			var Length = Match.index + Match[0].length;
			Names[Match[1]] = [ Length - Match[1].length, Length ];
		}
		return Names;
	}

	// Initialize the editor.
	Editor.Initialize = function() {
		Editor.Container = $("#Main-Editor");
		DarkMode = new Darkmode();
		// Basic initialization
		Galapagos = new GalapagosEditor(document.getElementById("Main-CodeMirror"), {
			Wrapping: true,
			OnUpdate: (Changed, Update) => {
				if (Changed && !IgnoreUpdate) {
					Editor.Call({ Type: "CodeChanged" });
				}
			}
		});
		// Other interfaces
		Overlays.Initialize();
		Editor.ClearDialogs();
		Editor.Galapagos = Galapagos;
	}

	// Engine features
	// Resize: Resize the viewport width (on mobile platforms)
	Editor.Resize = function (Ratio) {
		$("body").addClass("Mobile");
		$("#viewport").attr("content", `width=device-width,initial-scale=${Ratio},maximum-scale=${Ratio},minimum-scale=${Ratio},user-scalable=no,viewport-fit=cover`);
	}

	// SetDesktop: Set the desktop mode.
	Editor.SetFontsize = function(Status) {
		$("html").css("font-size", Status + "px");
	}

	// ToggleDark: Toggle the dark mode.
	Editor.ToggleDark = function(Status) {
		if (Status != DarkMode.isActivated()) DarkMode.toggle();
	}

	// SetPlatform: Set the platform of the editor.
	Editor.SetPlatform = function(Platform) {
		$("body").addClass(Platform);
	}

	// TransformLinks: Transform the embedded links.
	Editor.TransformLinks = function(Element) {
		Element.find("a").each((Index, Link) => {
			Link = $(Link);
			var Href = Link.attr("href");
			Link.attr("href", "javascript:void(0);");
			Link.on("click", function() { Editor.Call({ Type: "Visit", Target: Href })});
		});
	}

	// Call: Call the Unity engine.
	Editor.Call = function(Code) {
		PostMessage(JSON.stringify(Code));
	}

	return Editor;
}();

// Overlays: Overlays manager.
Overlays = function() {
	var Overlays = {};

	// Initialize: Initialize all overlays.
	Overlays.Initialize = function() {
		// RotateScreen: Rotate-Screen dialog.
		Overlays.RotateScreen = $("#Rotate-Screen").asOverlay().click(() => Overlays.RotateScreen.Hide());
	}

	return Overlays;
}();

// Localized: Localized support.
Localized = function() {
	var Localized = {};

	// Initialize: Initialize the manager with given data.
	Localized.Initialize = function(Data, Language) {
		Localized.Data = Data;
		EditorLocalized.Switch(Language);
		$(".Localized").each((Index, Target) => $(Target).text(Localized.Get($(Target).text())));
	}

	// Get: Get localized string.
	Localized.Get = function(Source) {
		if (Localized.Data && Localized.Data.hasOwnProperty(Source))
			return Localized.Data[Source];
		return Source;
	}

	return Localized;
}();

// Commands: Handle the interaction of CodeMirror command center.
Commands = function() {
	var Commands = {};
	var Galapagos = null;
	var Outputs = null;
	var Fulltext = null;

	// Command center would be disabled before compile output come out.
	Commands.Disabled = false;
	// Whether it is visible.
	Commands.Visible = true;
	// Galapagos: Refers to the main editor.
	Commands.Galapagos = null;

	// Hide Galapagos and Command Center would show up
	Commands.Show = function() {
		Editor.Container.css("display", "none");
		Commands.Container.css("display", "block");
		bodyScrollLock.clearAllBodyScrollLocks();
		bodyScrollLock.disableBodyScroll(document.querySelector('div.command-output'));
		bodyScrollLock.disableBodyScroll(document.querySelector('div.command-fulltext'));
		Commands.HideFullText();
		Commands.Visible = true;
		Editor.ClearDialogs();
	}

	// Hide Command Center and Galapagos would show up
	Commands.Hide = function() {
		Editor.Container.css("display", "block");
		Commands.Container.css("display", "none");
		Commands.Visible = false;
		bodyScrollLock.clearAllBodyScrollLocks();
		bodyScrollLock.disableBodyScroll(document.querySelector('.CodeMirror-scroll'), { allowTouchMove: () => true });
	}

	// Following three variables are used for command histrory.
	var CommandStack = [];
	var CurrentCommand = [];
	var CurrentCommandIndex = 0;

	// Initialize the command center
	Commands.Initialize = function() {
		// Get the elements
		Commands.Container = $("#Command-Center");
		Outputs = $(".command-output");
		Fulltext = $(".command-fulltext");
		KeepSize = Outputs.children(".Keep").length;
		// CodeMirror Editor
		Galapagos = new GalapagosEditor(document.getElementById("Command-Input"), {
			OneLine: true, 
			OnKeyUp: (Event) => {
				const Key = Event.key;
				const Code = Event.code;
				// After press key `Enter`, excute command
				if (Key == "Enter" || Code == "Enter") {
					const Content = Galapagos.GetCode();
					Commands.ClearInput();
					if (!Content || Commands.Disabled) return;
					const Objective = $('#Command-Objective').val();
					Commands.Disabled = true;
					Commands.Execute(Objective, Content);
					CommandStack.push([Objective, Content]);
					CurrentCommandIndex = 0;
					CurrentCommand = [];
					Galapagos.CloseCompletion();
				}
				// After press key `ArrowUp`, get previous command from command history
				else if (Key == "ArrowUp" || Code == "ArrowUp") {
					if (CurrentCommandIndex >= CommandStack.length) return;
					CurrentCommandIndex += 1;
					const index = CommandStack.length - CurrentCommandIndex;
					Commands.SetCode(CommandStack[index][0], CommandStack[index][1]);
				}
				// After press key `ArrowDown`, get next command from command history
				else if (Key == "ArrowDown" || Code == "ArrowDown") {
					if (CurrentCommandIndex <= 1) {
						CurrentCommandIndex = 0;
						if (CurrentCommand.length == 0) {
							Commands.ClearInput();
						} else {
							Commands.SetCode(CurrentCommand[0], CurrentCommand[1]);
						}
						return;
					}
					const index = CommandStack.length - CurrentCommandIndex;
					Commands.SetCode(CommandStack[index][0], CommandStack[index][1]);
					CurrentCommandIndex -= 1;
				} else if (CurrentCommandIndex == 0) {
					const Content = Galapagos.GetCode();
					const Objective = $('#Command-Objective').val();
					CurrentCommand = [Objective, Content];
					CurrentCommandIndex = 0;
				}
			}
		});
		Commands.Galapagos = Galapagos;

		// Annotate by default
		AnnotateCode(Outputs.find(".keep code"), null, true);

		// Listen to selection changed
		/*var ExplainHandler = null;
		if (navigator.maxTouchPoints == 0) {
			document.addEventListener("selectionchange", () => {
				clearTimeout(ExplainHandler);
				ExplainHandler = setTimeout(() => {
					clearTimeout(ExplainHandler);
					Commands.Explain();
				}, 500);
			});
		}*/

		// Listen to the sizing
		if (window.VisualViewport)
			window.visualViewport.addEventListener("resize", () => {
				if (navigator.userAgent.indexOf("Macintosh") == -1 && navigator.userAgent.indexOf("Mac OS X") == -1) {
					var Height = window.visualViewport.height;
					$("#Container").css("height", `${Height}px`);
				} else {
					setTimeout(() => $(".command-output, .command-fulltext").css("padding-top", `calc(0.5em + ${document.body.scrollHeight - window.visualViewport.height}px)`), 100);
				}
				if (Commands.Visible) $(".command-output").scrollTop(100000);
			});
			
		Commands.Show();
	}

	// Batch printing support
	var Fragment = null;
	// Buffer size
	var BufferSize = 1000;
	// Keep size
	var KeepSize = -1;
	// Print to a batch.
	var WriteOutput = function(Element) {
		if (Fragment == null)
			Outputs.append(Element);
		else Fragment.append(Element);
	}
	// Open a printing batch.
	Commands.OpenBatch = function() {
		Fragment = $(document.createDocumentFragment());
	}
	// Close a printing batch.
	Commands.CloseBatch = function() {
		if (Fragment == null) return;
		// Trim the buffer (should refactor later) & the display
		var Length = Fragment.children().length;
		if (Length > BufferSize) {
			Fragment.children().slice(0, Length - BufferSize).remove();
			Outputs.children().slice(KeepSize).remove();
		} else {
			var NewLength = Outputs.children().length - KeepSize + Length;
			if (NewLength > BufferSize)
				Outputs.children().slice(KeepSize, NewLength - BufferSize + KeepSize).remove();
		}
		// Append to the display
		Outputs.append(Fragment);
		Fragment = null;
		Commands.ScrollToBottom();
	}

	// Print a line of input to the screen
	Commands.PrintInput = function(Objective, Content, Embedded) {
		if (Objective == null) Objective = $('#Command-Objective').val();
		else $('#Command-Objective').val(Objective);

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
		
		if (!Embedded) WriteOutput(Wrapper);
		Wrapper.attr("objective", Objective);
		Wrapper.attr("content", Content);

		// Click to copy
		Wrapper.children(".icon").on("click", () => {
			Commands.SetCode(Wrapper.attr("objective"), Wrapper.attr("content"));
			Editor.Call({ Type: "ClipboardWrite", Content: `${Wrapper.attr("objective")}: ${Wrapper.attr("content")}` });
		});

		// Run CodeMirror
		AnnotateCode(Wrapper.children(".content").children(".Code").children("span"), Content);
		return Wrapper;
	}

	// Provide for Unity to print compiled output
	Commands.PrintOutput = function(Content, Class) {
		var Output;
		switch (Class) {
			case "CompilationError":
				Output = $(`
					<p class="CompilationError output">${Localized.Get("抱歉，未能理解你输入的命令")}: ${Content}</p>
				`);
				break;
			case "RuntimeError":
				Output = $(`
					<p class="RuntimeError output">${Localized.Get(Content)}</p>
				`);
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
				var Output = null;
				if (typeof Content === 'string' || Content instanceof String) {
					if (Content.indexOf("<div class=\"block\">") >= 0) {
						Output = $(Content);
					} else {
						Output = $(`
							<p class="${Class} output">${Content}</p>
						`);
					}
				} else if (typeof Content === 'array' || Content instanceof Array) {
					Output = $(`
						<div class="block">
							${Content.map((Source) => `<p class="${Class} output">${Source}</p>`).join("")}
						</div>
					`);
				} else if (Content.Parameter == "-full") {
					this.ShowFullText(Content);
				} else {
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
					AnnotateInput(Output.find("div.command"));
					AnnotateCode(Output.find("code"));
				}
				break;
			default:
				var Output = $(`
					<p class="${Class} output">${Content}</p>
				`);
				break;
		}
		WriteOutput(Output);

		/*Output.on("click", (event) => {
			previousNode = event.path[0].previousElementSibling;
			if (previousNode != null && previousNode.className == "command-wrapper") {
				$(".command-wrapper").removeClass("active");
				previousNode.className += " active";
				previousNode.children[1].style.display = "flex";
			}
		});*/

		if (Fragment == null) Commands.ScrollToBottom();
	}
	
	/* Rendering stuff */
	// Annotate some code snippets.
	var AnnotateCode = function(Target, Content, AllowCopy) {
		for (var Item of Target.get()) {
			var Snippet = $(Item);
			// Render the code
			var Output = Galapagos.Highlight(Content != null ? Content : Item.innerText);
			Snippet.empty().append($(Output));
			// Copy support
			if (AllowCopy && Item.innerText.trim().indexOf(" ") >= 0 && Snippet.parent("pre").length == 0)
				Snippet.addClass("copyable").append($(`<img class="copy-icon" src="images/copy.png"/>`)).on("click", function() {
					Commands.SetCode("observer", this.innerText);
				});
		}
	}
	
	// Annotate some code inputs.
	var AnnotateInput = function(Query) {
		Query.each((Index, Item) => {
			Item = $(Item);
			Item.replaceWith(Commands.PrintInput(Item.attr("objective"), Item.attr("target"), true));
		});
	}

	// Generate a link for another command.
	var LinkCommand = function(Query) {
		Query.each((Index, Item) => {
			Item = $(Item);
			var Target = Item.attr("target");
			if (Target == null) Target = Item.text();
			var Objective = Item.attr("objective");
			if (!Objective) Objective = "null";
			Item.attr("href", "javascript:void(0)");
			Item.attr("onclick", `Commands.Execute(${Objective}, '${Target}')`);
		})
		return Query;
	}

	// Render tips for an agent type.
	var RenderAgent = (Agent) => {
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
	Commands.ClearInput = function() {
		Galapagos.SetCode("");
	}

	// Clear the output region of Command Center
	Commands.ClearOutput = function() {
		Outputs.children().slice(KeepSize).remove();
	}

	// After user entered input, screen view should scroll down to the botom line
	Commands.ScrollToBottom = function() {
		const scrollHeight = document.querySelector('.command-output').scrollHeight;
		document.querySelector('.command-output').scrollTop = scrollHeight;
	}

	// Execute a command from the user
	Commands.Execute = function(Objective, Content) {
		Editor.Call({ Type: "CommandExecute", Source: Objective, Command: Content });
		Commands.PrintInput(Objective, Content);
		Commands.ScrollToBottom();
	}

	// Set the content of command input
	Commands.SetCode = function(Objective, Content) {
		document.querySelector('select').value = Objective.toLowerCase();
		Galapagos.SetCode(Content);
		setTimeout(() => Galapagos.SetCursorPosition(Content.length), 1);
	}

	// Provide for Unity to notify completion of the command
	Commands.FinishExecution = function(Status, Message) {
		Commands.HideFullText();
		Commands.PrintOutput(Message, Status);
		Commands.Disabled = false;
	}

	// Show the full text of a command.
	var PreviousVisible = false;
	Commands.ShowFullText = function(Data) {
		PreviousVisible = Commands.Visible;
		if (!Commands.Visible) Commands.Show();
		// Change the status
		Fulltext.show();
		Outputs.hide();
		// Render the subject
		$(Fulltext.find("h2 strong")).text(Data["display_name"]);
		$(Fulltext.find("h2 span")).text(`(${Data["agents"].map((Agent) => `${RenderAgent(Agent)}`).join(", ")})`);
		// Render the list
		var SeeAlso = Fulltext.find("ul.SeeAlso").empty();
		for (var Primitive in Data["see_also"])
			LinkCommand($(`<li><a class="command" target="help ${Primitive}">${Primitive}</a> - ${Data["see_also"][Primitive]}</li>`).appendTo(SeeAlso).find("a"));
		// Machine-translation
		var Translator = Fulltext.find(".translator");
		if (Data["translation"] != null && Data["verified"] != true)
			Translator.show();
		else Translator.hide();
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
			if (Content != null) Fulltext.find("div.fulltext")
				.html(new showdown.Converter().makeHtml(Content));
			AnnotateCode(Fulltext.find("code"), null, true);
			Fulltext.get(0).scrollTop = 0;
		}
		SetCode(Data["translation"] != null ? Data["translation"] : Data["content"]);
		// Acknowledge
		Editor.TransformLinks(Fulltext.find(".Acknowledge").html(Data["acknowledge"]));
	}

	// Hide the full text mode.
	Commands.HideFullText = function(Explicit) {
		Fulltext.hide();
		Outputs.show();
		Commands.ScrollToBottom();
		if (Explicit && !PreviousVisible) Commands.Hide();
	}

	// Explain: Explain the selected text in the command center.
	Commands.Explain = function() {
		var Selection = window.getSelection();
		if (Selection.rangeCount == 0) return;
		var Parent = $(window.getSelection().focusNode).parents();
		if (!Parent.is(".command-output")) return;
		// Check the plain text
		if (ExplainInternal(Selection.toString())) return;
		// Check the grammatical tag
		if (Parent.hasClass("cm-command") || Parent.hasClass("cm-reporter") || Parent.hasClass("cm-keyword")) 
			ExplainInternal(Parent.get(0).innerText);
	}

	var ExplainInternal = function(Command) {
		if (!EditorDictionary.Check(Command)) return false;
		Commands.ScrollToBottom();
		Commands.Execute(null, `ask ${Command} -full`);
	}

	return Commands;
}();

(function($, undefined){
	$.fn.asOverlay = function(Timeout = 3000, Animation = 300) {
		this.Hide = () => this.fadeOut(Animation);
		this.Show = () => {
			clearTimeout(this.timeout);
			this.timeout = setTimeout(() => this.fadeOut(Animation), Timeout);
			this.fadeIn(Animation);
		}
		return this;
	}
})(jQuery);