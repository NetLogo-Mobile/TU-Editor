import { Localized } from "../../CodeMirror-NetLogo/src/editor";
import { ChatManager } from "./chat/chat-manager";
import { ChatNetwork } from "./chat/chat-network";
import { ChatResponseType } from "./chat/client/chat-response";
import { Breed, NetLogoContext, Procedure } from "./chat/client/languages/netlogo-context";
import { CommandTab } from "./command/command-tab";
import { EditorTab } from "./editor/editor-tab";
import { LegacyLocalized, RotateScreen } from "./legacy";
import { Tab } from "./tab";

declare const { Darkmode }: any;
type Darkmode = any;

/** TurtleEditor: The multi-tab code editor for Turtle Universe. */
export class TurtleEditor {
  // #region "Foundational Interfaces"
  /** Container: The container HTMLElement. */
  public readonly Container: HTMLElement;
  /** Darkmode: The darkmode support. */
  public readonly Darkmode: Darkmode;
  /** PostMessage: The function to call to send messages to the facilitator. */
  public static PostMessage: ((Message: string) => void) | null;
  /** Constructor: Constructor. */
  public constructor(Container: HTMLElement, PostMessage: (Message: string) => void | null) {
    this.Container = Container;
    TurtleEditor.PostMessage = PostMessage;
    // Initialize the darkmode
		this.Darkmode = new Darkmode();
    // Initialize the tabs
    this.EditorTabs = [new EditorTab($(Container).children("div.editor").get(0)!, this)];
    this.CommandTab = new CommandTab($(Container).children("div.commands").get(0)!, this);
    this.EditorTabs[0].Galapagos.AddChild(this.CommandTab.Galapagos);
		// Listen to the sizing
		if (window.visualViewport)
			window.visualViewport.addEventListener("resize", () => this.CurrentTab?.SyncSize());
    this.CommandTab.Show();
  }
  /** Call: Call the facilitator (by default, the Unity Engine). */
  public static Call(Message: any) {
    if (TurtleEditor.PostMessage)
      TurtleEditor.PostMessage(JSON.stringify(Message));
    else console.log(Message);
  }
  // #endregion

  // #region "Tab Management"
  /** CommandTab: The command center tab. */
  public readonly CommandTab: CommandTab;
  /** EditorTabs: The editor tabs. */
  public readonly EditorTabs: EditorTab[] = [];
  /** CurrentTab: The visible tab. */
  public CurrentTab: Tab | null = null;
  /** GetAllTabs: Get all tabs. */
  public GetAllTabs(): Tab[] {
    return [this.CommandTab, ...this.EditorTabs];
  }
  /** HideAllTabs: Hide all tabs. */
  public HideAllTabs() {
    this.GetAllTabs().forEach(Tab => Tab.Hide());
  }
  /** BlurAll: Blur all tabs. */
  public BlurAll() {
    this.GetAllTabs().forEach(Tab => Tab.Blur());
  }
  // #endregion

	// #region "Editor Interfaces"
  /** ProjectName: The name of the project. */
  public ProjectName?: string;
	/** GetContext: Get the NetLogo context. */
	public GetContext(): NetLogoContext {
    var Galapagos = this.EditorTabs[0].Galapagos;
    Galapagos.ForceParse();
		var State = Galapagos.GetState();
		// Create the procedures map
		var Procedures: Procedure[] = [];
		for (var [Name, Procedure] of State.Procedures) {
			Procedures.push({ Name: Name, Arguments: [...Procedure.Arguments], IsCommand: Procedure.IsCommand });
		}
		// Create the breeds map
		var Breeds: Breed[] = [];
		for (var [Name, Breed] of State.Breeds) {
			Breeds.push({ Singular: Breed.Singular, Plural: Breed.Plural, Variables: [...Breed.Variables], BreedType: Breed.BreedType });
		}
    // Other contexts
		return {
      Language: "NetLogo",
			Extensions: [...State.Extensions],
			Globals: [...State.Globals],
			WidgetGlobals: [...State.WidgetGlobals],
			Procedures: Procedures,
			Breeds: Breeds
		}
	}
	// #endregion

  // #region "Editor Statuses"
  /** Resize: Resize the viewport width (on mobile platforms) */
  public Resize(Ratio: number) {
    $("body").addClass("mobile");
    $("#viewport").attr("content", `width=device-width,initial-scale=${Ratio},maximum-scale=${Ratio},minimum-scale=${Ratio},user-scalable=no,viewport-fit=cover`);
  }
  /** ToggleDark: Toggle the dark mode. */
  public ToggleDark(Status: boolean) {
    if (Status != this.Darkmode.isActivated()) this.Darkmode.toggle();
  }
  /** SetPlatform: Set the platform of the editor. */
  public SetPlatform(Platform: string) {
    $("body").addClass(Platform);
  }
  /** Reset: Reset the editor. */
  public Reset() {
    this.CommandTab.Reset();
    this.EditorTabs.forEach(Tab => Tab.Reset());
  }
  /** SetChatBackend: Set the chat backend domain. */
  public static SetChatBackend(Domain: string) {
    ChatNetwork.Domain = Domain;
    ChatManager.Available = !!Domain && Domain != "";
  }
  // #endregion
}

/** Export classes globally. */
try {
  (window as any).TurtleEditor = TurtleEditor;
  (window as any).TurtleLocalized = LegacyLocalized;
  (window as any).RotateScreen = RotateScreen();
} catch (error) { }
