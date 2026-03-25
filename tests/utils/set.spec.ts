import { describe, expect, it } from "vitest"

import { set } from "../../src/index.js"


it("works", () => {
	const obj = { a: { b: ["c"]} }
	const value = set(obj, ["a", "b", 0], "changed")
	expect(obj).to.equal(value)
	expect(value.a.b[0]).to.equal("changed")
})

it("returns given value when passed no keys", () => {
	const obj = { a: { b: ["c"]} }
	expect(() => {
		const value = set(obj, [], "change")
		expect(value).to.equal("change")
		expect(obj).to.deep.equal({ a: { b: ["c"]} })
	}).to.not.throw()
})

it("works even if strings used for arrays", () => {
	const obj = { a: { b: ["c"]} }
	const value = set(obj, ["a", "b", "0"], "change")
	expect(obj).to.equal(value)
	expect(obj.a.b[0]).to.equal("change")
})

it("works with deep paths on a shallow object", () => {
	const obj = { }
	const value = set(obj, ["a", "b", "c"], "changed")
	expect(obj).to.deep.equal({
		a: { b: { c: "changed" } }
	})
	expect(value).to.deep.equal(obj)
	expect((obj as any).a.b.c).to.equal("changed")
})

it("overrides the needed path", () => {
	const obj = { a: "will get overwritten" }
	const value = set(obj, ["a", "b", "c"], "changed")
	expect(obj).to.deep.equal({
		a: { b: { c: "changed" } }
	})
	expect(value).to.deep.equal(obj)
	expect((obj as any).a.b.c).to.equal("changed")
})

it("does not override arrays", () => {
	const obj = { a: "will NOT get overwritten" }
	expect(() => {
		set(obj, ["a", "b"], "changed")
	}).to.throw()
})
