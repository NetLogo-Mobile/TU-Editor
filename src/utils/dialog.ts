import { Localized } from "../legacy";

/** ShowConfirm: Show a confirm dialog. */
const ShowConfirm = function(Subject: string, Content: string, OK: () => void, Cancel?: () => void) {
	($ as any).confirm({
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

export { ShowConfirm }