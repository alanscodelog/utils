/**
 * Reads and automatically parses contents from the user's clipboard.
 *
 * This MUST be called from an event handler and it triggers a permission popup. If not called from an event handler or permission is denied it will throw a `NotAllowedError`.
 *
 * It will also throw if the navigator.keyboard API is not available or if any of the parsing fails.
 *
 * ```ts
 * const result = await paste().catch(handleError)
 * if (result[0].type === "json") console.log(result[0].data)
 * if (result[0].type === "image") {
 * 	const img = new Image()
 * 	img.src = URL.createObjectURL(result.data)
 *  	document.body.appendChild(img)
 * }
 * ```
 */
export async function readFromClipboard(): Promise<
	(
		| { type: "json", data: Record<string, unknown> | unknown[] }
		| { type: "image", data: Blob }
		| { type: "text", data: string }
		| { type: "unknown", data: null }
	)[]
> {
	if (!navigator.clipboard) {
		throw new Error("Could not read from clipboard, your browser is not supported.")
	}

	const items = await navigator.clipboard.read()

	return Promise.all(items.map(async item => {
		if (item.types.includes("web application/json")) {
			const blob = await item.getType("web application/json")
			const jsonText = await blob.text()
			return { type: "json", data: JSON.parse(jsonText) }
		}

		const imageType = item.types.find(type => type.startsWith("image/"))
		if (imageType) {
			const blob = await item.getType(imageType)
			return { type: "image", data: blob }
		}

		if (item.types.includes("text/plain")) {
			const blob = await item.getType("text/plain")
			const text = await blob.text()
			return { type: "text", data: text }
		}
		return { type: "unknown", data: null }
	}))
}
