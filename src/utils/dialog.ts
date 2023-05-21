import { Localized } from "../../../CodeMirror-NetLogo/src/editor";
declare const { toastr }: any;

/** ShowConfirm: Show a confirm dialog. */
export function ShowConfirm(Subject: string, Content: string, OK: () => void, Cancel?: () => void) {
	($ as any).confirm({
		title: Localized.Get(Subject),
		content: Localized.Get(Content),
		type: 'blue',
		useBootstrap: false,
		buttons: {   
			ok: {
				text: Localized.Get("OK"),
				btnClass: 'btn-primary',
				keys: ['enter'],
				action: OK
			},
			cancel: {
				text: Localized.Get("Cancel"),
				action: Cancel
			}
		}
	});
}

/** Toast: Show a toast. */
export function Toast(Type: string, Content: string, Subject?: string) {
	toastr[Type](Content, Subject);
}