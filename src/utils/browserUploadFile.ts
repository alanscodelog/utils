import type { FileUploadOptions } from "../types/browserUploadFile.js"

/**
 * Triggers a file selection dialog and returns the array of selected files.
 *
 * Attempts to use the File System Access API first, falling back to a native file input element.
 *
 * @env browser
 */

export async function browserUploadFile(
	/** Options to configure the file picker */
	{
		types = [],
		multiple = false,
		useFileSystemApi = true,
		excludeAcceptAllOption = false
	}: FileUploadOptions = {}
): Promise<File[]> {
	if (typeof window === "undefined" || typeof document === "undefined") {
		throw new Error("browserOpenFile can only be used in a browser environment.")
	}

	if (useFileSystemApi && "showOpenFilePicker" in window) {
		try {
			const handles = await (window as any).showOpenFilePicker({
				multiple,
				types,
				excludeAcceptAllOption,
			})
			return await Promise.all(handles.map((handle: any) => handle.getFile()))
		} catch (error) {
			if ((error as Error).name === "AbortError") return []
		}
	}

	return new Promise(resolve => {
		const input = document.createElement("input")
		input.type = "file"
		input.multiple = multiple
		input.style.display = "none"

		if (types) {
			const acceptList = types.flatMap(t =>
				Object.entries(t.accept).flatMap(([mime, exts]) => [mime, ...exts])
			)
			input.accept = Array.from(new Set(acceptList)).join(",")
		}

		input.onchange = () => {
			resolve(Array.from(input.files ?? []))
			input.remove()
		}

		input.oncancel = () => {
			resolve([])
			input.remove()
		}
		
		document.body.appendChild(input)
		input.click()
	})
}
