/**
 * Copies text, JSON objects, images, or plain blobs to the user's clipboard.
 *
 * Note, it can throw either because navigation.clipboard is not supported or new Blob or ClipboardItem themselves throw.
 *
 * ```ts
 * await copyToClipboard("Hello World!").catch(handleError)
 *
 * await copyToClipboard({ id: 101, roles: ["admin"] }).catch(handleError)
 *
 * const response = await fetch("https://example.com/image.png")
 * const imageBlob = await response.blob()
 * await copyToClipboard(imageBlob);
 * ```
 */
export async function copyToClipboard(
	data: string | Record<string, unknown> | unknown[] | Blob,
	options: {
		/** Optional explicit MIME type override for Blobs or custom formats */
		mimeType?: string
	} = {}
): Promise<void> {
	if (!navigator.clipboard) {
		throw new Error("Could not copy to clipboard, your browser is not supported.")
	}

	let item: ClipboardItem | null = null
	let text: string | null = null
	if (typeof data === "string") {
		text = data
	} else if (data instanceof Blob) {
		const type = options.mimeType ?? data.type
		item = new ClipboardItem({ [type]: data })
	} else if (typeof data === "object" && data !== null) {
		const jsonString = JSON.stringify(data)
		const type = options.mimeType ?? "web application/json"
		const blob = new Blob([jsonString], { type })
		item = new ClipboardItem({ [type]: blob })
	} else {
		text = String(data)
	}

	if (item) {
		await navigator.clipboard.write([item])
	} else if (text !== null) {
		await navigator.clipboard.writeText(text)
	}
}
