declare module 'cache-manager' {
	export type Store = unknown
	export function caching(store: Store): Promise<any>
}

declare module '@adiwajshing/keyed-db' {
	export default class KeyedDB<T, K = string> {
		constructor(compare: unknown, idGetter: (item: T) => K)
		get(id: K): T | undefined
		upsert(...items: T[]): void
		insertIfAbsent(...items: T[]): T[]
		update(id: K, updater: (item: T) => void): boolean
		deleteById(id: K): void
		delete(item: T): void
		clear(): void
		filter(predicate: (item: T) => boolean): { all(): T[] }
		all(): T[]
	}
}

declare module '@adiwajshing/keyed-db/lib/Types' {
	export type Comparable<T, K> = {
		key: (item: T) => K
		compare: (a: K, b: K) => number
	}
}
