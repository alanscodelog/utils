/**
 * Triggers a file download with the given name and contents (attempt to autodetect the type if not provided).
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
	contents: string | Blob | Record<string, unknown> | unknown[],
	options: Pick<FilePropertyBag,"type"> & { useFileSystemApi?: boolean } = {}
): Promise<void> {
	if (typeof window === "undefined" || typeof document === "undefined") {
		throw new Error("browserSaveFile can only be used in a browser environment.")
	}

	const useFileSystemApi = options.useFileSystemApi ?? true
	let type = options.type

	let finalContents: BlobPart
	const extension = name.split(".").pop()?.toLowerCase() ?? "txt"

	if (contents instanceof Blob) {
		finalContents = contents
		type ??= contents.type || "application/octet-stream"
	} else if (typeof contents === "object" && contents !== null) {
		finalContents = JSON.stringify(contents, null, 2)
		type ??= "application/json"
	} else {
		finalContents = contents
		if (!type) {
			if (extension === "json") type = "application/json"
			else if (extension === "html") type = "text/html"
			else if (extension === "csv") type = "text/csv"
			else type = "text/plain"
		}
	}

	if (useFileSystemApi && "showSaveFilePicker" in window) {
		try {
			const handle = await window.showSaveFilePicker({
				suggestedName: name,
				types: [{
					description: `${extension.toUpperCase()} File`,
					accept: { [type]: [`.${extension}`] as any }
				}]
			})
			const writable = await handle.createWritable()
			await writable.write(finalContents)
			await writable.close()
			return
		} catch (error) {
			// user canceled the picker dialog
			if ((error as Error).name === "AbortError") return
			// fallback to legacy download anchor if picker fails unexpectedly
		}
	}

	const file = new File([finalContents], name, { type })
	const url = window.URL.createObjectURL(file)
	
	const link = document.createElement("a")
	link.href = url
	link.download = name
	
	document.body.appendChild(link)
	link.click()
	
	document.body.removeChild(link)
	window.URL.revokeObjectURL(url)
}
