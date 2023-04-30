import { Tab } from "src/tab";
import { CommandTab } from "./command-tab";
import { TransformLinks, RenderAgent, LinkCommand } from "src/utils/element";
declare const { showdown }: any;

/** FullTextDisplay: Display the full-text help information. */
export class FullTextDisplay {
    /** Tab: The related command tab. */
    public readonly Tab: CommandTab;
    /** Container: The full-text help area.  */
	public readonly Container: JQuery<HTMLElement>;
    /** RequestedTab: The tab that requested the full text. */
	private RequestedTab: Tab | null = null;
    /** Constructor: Create a new full-text display. */
    constructor(Tab: CommandTab) {
        this.Tab = Tab;
        this.Container = $(Tab.Container).find(".command-fulltext");
    }
	/** ShowFullText: Show the full text of a command. */
	public ShowFullText(Data: any) {
		this.RequestedTab = this.Tab.Editor.CurrentTab;
		if (!this.Tab.Visible) this.Tab.Show();
		// Change the status
		this.Container.show();
		// Render the subject
		this.Container.find("h2 strong").text(Data["display_name"]);
		this.Container.find("h2 span").text(`(${Data["agents"].map((Agent: any) => `${RenderAgent(Agent)}`).join(", ")})`);
		// Render the list
		var SeeAlso = this.Container.find("ul.SeeAlso").empty();
		for (var Primitive in Data["see_also"])
            LinkCommand($(`<li><a class="command" target="help ${Primitive}">${Primitive}</a> - ${Data["see_also"][Primitive]}</li>`).appendTo(SeeAlso).find("a"));
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
		var SetCode = (Content: any) => {
			if (Content != null) this.Container.find("div.fulltext")
				.html(new showdown.Converter().makeHtml(Content));
			this.Tab.AnnotateCode(this.Container.find("code"), undefined, true);
			this.Container.scrollTop(0);
		};
		SetCode(Data["translation"] != null ? Data["translation"] : Data["content"]);
		// Acknowledge
		TransformLinks(this.Tab.Editor, this.Container.find(".Acknowledge").html(Data["acknowledge"]));
	}
	/** HideFullText: Hide the full text mode. */
	public HideFullText() {
		if (!this.Container.is(":visible")) return;
		this.Container.hide();
        this.RequestedTab?.Show();
	}
}