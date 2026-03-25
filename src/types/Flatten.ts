/** For flattening an object type. */
export type Flatten<T> = {[K in keyof T]: T[K] }
