/**
 * Sets an objects key by keypath array then returns the object.
 *
 * If keypath does not have any keys, the object will *not* be mutated, and the value to assign will just be returned.
 *
 * If the path does not exist (the path is deeper than the object), it will be created. This WILL overwrite existing values unless they are objects or arrays that can't be written to with the given string, in those cases, careful, it WILL THROW.
 *
 * ```ts
 * const obj = { a: { b: ["c"]} }
 * // mutates and returns the mutated obj
 * set(obj, ["a", "b", 0], "d")
 * // obj.a.b[0] is now "d"
 *
 * const obj2 = {}
 * set(obj2, ["a", "b", "c"], "d")
 * // obj2.a.b.c is now "d"
 *
 * const obj3 = {a: "in the way"}
 * set(obj3, ["a", "b", "c"], "d")
 *
 * const obj4 = {a: "in the way"}
 * set(obj4, ["a", "b"], "d") // throws (we can't create a property b on a string)
 * ```
 */
export function set(
	mutated: any,
	keypath: (string | number)[],
	val: any,
): any {
	if (keypath.length === 0) {
		return val
	}
	let lastObj = mutated
	for (let i = 0; i < keypath.length - 1; i++) {
		const key = keypath[i]
		const value = lastObj[key]
		if (value === undefined || i < keypath.length - 2) {
			lastObj[keypath[i]] = {}
		}
		lastObj = lastObj[key]
	}
	lastObj[keypath[keypath.length - 1]] = val
	return mutated
}
