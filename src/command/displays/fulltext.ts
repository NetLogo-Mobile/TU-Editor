import { Tab } from "../../tab";
import { RenderAgent, MarkdownToHTML, PostprocessHTML } from "../../utils/element";
import { Display } from "./display";
import { CommandTab } from "../command-tab";
import { NetLogoUtils } from "../../utils/netlogo";

/** FullTextDisplay: Display the full-text help information. */
export class FullTextDisplay extends Display {
	/** Constructor: Create a new output section. */
	public constructor(Tab: CommandTab) {
		super(Tab, ".command-fulltext");
	}
    /** RequestedTab: The tab that requested the full text. */
	private RequestedTab: Tab | null = null;
	/** ShowFullText: Show the full text of a command. */
	public ShowFullText(Data: any) {
		this.RequestedTab = this.Tab.Editor.CurrentTab;
		this.Show();
		// Render the subject
		this.Container.find("h2 strong").text(Data["display_name"]);
		this.Container.find("h2 span").text(`(${Data["agents"].map((Agent: any) => `${RenderAgent(Agent)}`).join(", ")})`);
		// Render the list
		var SeeAlso = this.Container.find("ul.SeeAlso").empty();
		for (var Primitive in Data["see_also"])
            $(`<li><a href="help:${Primitive}">${Primitive}</a> - ${Data["see_also"][Primitive]}</li>`).appendTo(SeeAlso).find("a");
		// Machine-translation
		var Translator = this.Container.find(".translator");
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
		var SetCode = (Content: string) => {
			if (Content != null) this.Container.find("div.fulltext")
				.html(MarkdownToHTML(Content));
			NetLogoUtils.AnnotateCodes(this.Container.find("code"));
			this.Container.scrollTop(0);
		};
		SetCode(Data["translation"] != null ? Data["translation"] : Data["content"]);
		// Acknowledge
		this.Container.find(".Acknowledge").html(Data["acknowledge"]);
		PostprocessHTML(this.Tab.Editor, this.Container);
	}
	/** HideFullText: Hide the full text mode. */
	public HideFullText() {
		if (!this.Container.is(":visible")) return;
		this.Container.hide();
        this.RequestedTab?.Show();
	}
}