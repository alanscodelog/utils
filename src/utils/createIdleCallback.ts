// typescript doesn't have this because it's experimental
interface IdleDeadline {
	readonly didTimeout: boolean
	timeRemaining: () => number
}

type IdleCallback = (deadline: IdleDeadline) => void

/**
 * Easier to control requestIdleCallbacks with fallback support for environments without requestIdleCallback (either for browsers which don't have support or for node).
 *
 * Returns { trigger, cancelPendingCallbacks, callImmediately, isPending }.
 *
 * ```ts
 * // e.g. a sync function, supports experimental deadline if needed
 * function someHeavyFunc(deadline: IdleDeadline) {
 * 	while (deadline.timeRemaining() > 0 && tasks.length > 0) {
 * 		process(tasks.shift());
 * 	}
 * }
 *
 * const {
 * 	trigger,
 * 	callImmediately,
 * 	cancelPendingCallbacks,
 * 	isPending
 * } = createIdleCallback(
 * 	someHeavyFunc,
 * 	{ timeout: 2000 },
 * 	// if you need to update a reactive variable in your framework, e.g. vue
 * 	(_) => isPending.value = _
 * )
 *
 * // above by itself does nothing, you must call trigger to queue the request
 * trigger() // cancels any pending and requests idle callback
 * ```
 */

export function createIdleCallback(
	callback: IdleCallback,
	requestIdleCallbackOptions?: { timeout?: number },
	onIsPending?: (value: boolean) => void
): {
	trigger: () => void
	callImmediately: () => void
	cancelPendingCallbacks: () => void
	getIsPending: () => boolean
} {
	let idleId: any | undefined
	let isPending = false

	const isBrowser = typeof window !== "undefined"
	const hasNative = isBrowser && "requestIdleCallback" in window
	
	const schedule = hasNative
		? window.requestIdleCallback.bind(window)
		: (cb: IdleCallback, opts?: { timeout?: number }) => {
			// capture the exact moment the callback actually starts execution
			const timeoutId = setTimeout(() => {
				const executionStart = Date.now()
				cb({
					didTimeout: false,
					timeRemaining: () => Math.max(0, 50 - (Date.now() - executionStart))
				})
			}, opts?.timeout ?? 1)
			return timeoutId
		}

	const cancel = hasNative
		? window.cancelIdleCallback.bind(window)
		: clearTimeout

	function cancelPendingCallbacks(): void {
		if (idleId !== undefined) {
			cancel(idleId)
			idleId = undefined
			setIsPending(false)
		}
	}

	function trigger(): void {
		cancelPendingCallbacks()
		setIsPending(true)

		idleId = schedule(deadline => {
			idleId = undefined
			setIsPending(false)
			callback(deadline)
		}, requestIdleCallbackOptions)
	}

	function callImmediately(): void {
		cancelPendingCallbacks()
		callback({
			didTimeout: true,
			timeRemaining: () => 0
		})
	}

	function getIsPending(): boolean { return isPending }
	
	function setIsPending(value: boolean): void {
		isPending = value
		onIsPending?.(value)
	}

	return {
		trigger,
		cancelPendingCallbacks,
		callImmediately,
		getIsPending
	}
}

