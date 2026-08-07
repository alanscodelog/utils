export type FileUploadOptions = {
	/**
	 * Array of allowed file types and extensions.
	 *
	 * Follows the File System Access API structure. Is converted automatically if we fall back to a native file input element.
	 */
	types?: { description?: string, accept: Record<string, string[]> }[]
	/** For the File System Access API only (prevents user from picking files that don't match the mime type.
	 *
	 * @default false
	 */
	excludeAcceptAllOption?: false
	/** Allow multiple file selection.
	 *
	 * @default false
	 */
	multiple?: boolean
	/** Whether to attempt using the File System Access API, true by default. */
	useFileSystemApi?: boolean
}
