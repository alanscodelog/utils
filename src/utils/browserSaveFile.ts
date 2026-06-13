/**
 * Triggers a file download with the given name and contents.
 *
* Attempts to use the File System Access API first, falling back to temporarily appending a link element to the document body, clicking it, then quickly removing it.
 *
 * Note: In the latter case the download might be blocked or might prompt the user to allow multiple downloads after the first one if there is no user interaction with the page between each call.
 *
 * This means it can fail silently. Also we have no way of knowing if it worked or when/if the file downloaded.
 *
 * @env browser
 */

export async function browserSaveFile(
	name: string,
	contents: string,
	{ type = "text/plain", lastModified }: FilePropertyBag = {},
	{ useFileSystemApi = true }: { useFileSystemApi?: boolean } = {}
): Promise<void> {
	if (typeof window === "undefined" || typeof document === "undefined") {
		throw new Error("browserSaveFile can only be used in a browser environment.")
	}

	if (useFileSystemApi && "showSaveFilePicker" in window) {
		try {
			const handle = await window.showSaveFilePicker({
				suggestedName: name,
				types: [{
					description: "Text File",
					accept: { [type]: [`.${name.split(".").pop() ?? "txt"}`]} as any
				}]
			})
			const writable = await handle.createWritable()
			await writable.write(contents)
			await writable.close()
			return
		} catch (error) {
			// user canceled the picker dialog
			if ((error as Error).name === "AbortError") return
		}
	}

	const file = new File([contents], name, { type, lastModified })
	const url = window.URL.createObjectURL(file)
	
	const link = document.createElement("a")
	link.href = url
	link.download = name
	
	document.body.appendChild(link)
	link.click()
	
	document.body.removeChild(link)
	// prevent memory leak
	window.URL.revokeObjectURL(url)
}

