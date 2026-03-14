import { Err, Ok, type Result } from "./Result.js"

export function jsonSafeParse<T>(
	json: string,
	reviver?: Parameters<typeof JSON.parse>[1],
): Result<T, Error> {
	try {
		return Ok(JSON.parse(json, reviver))
	} catch (err) {
		return Err(err as any)
	}
}
