declare const { EditorLocalized }: any;

// LegacyLocalized: Localized support.
export const LegacyLocalized = function () {
	var Localized: any = {};

	// Initialize: Initialize the manager with given data.
	Localized.Initialize = function (Data: any, Language: string) {
		Localized.Data = Data;
		EditorLocalized.Switch(Language);
		$(".Localized").each((Index, Target) => {
			$(Target).text(Localized.Get($(Target).text()))
		});
	}

	// Get: Get localized string.
	Localized.Get = function (Source: string): string {
		if (Localized.Data && Localized.Data.hasOwnProperty(Source))
			return Localized.Data[Source];
		return Source;
	}

	return Localized;
}();

// RotateScreen: Show rotate screen prompt.
export const RotateScreen = function () {
	(function ($, undefined) {
		($.fn as any).asOverlay = function (Timeout = 3000, Animation = 300) {
			this.Hide = () => this.fadeOut(Animation);
			this.Show = () => {
				clearTimeout(this.timeout);
				this.timeout = setTimeout(() => this.fadeOut(Animation), Timeout);
				this.fadeIn(Animation);
			}
			return this;
		}
	})(jQuery);

	var RotateScreen = $(".rotate-screen");
	(RotateScreen as any).asOverlay().click(() => RotateScreen.hide());
	return RotateScreen;
};