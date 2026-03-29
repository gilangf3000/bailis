import { caching, type Store } from 'cache-manager'
import { proto } from '../../WAProto/index.js'
import type { AuthenticationCreds } from '../Types'
import { initAuthCreds } from '../Utils/auth-utils'
import { BufferJSON } from '../Utils/generics'
import logger from '../Utils/logger'

const makeCacheManagerAuthState = async (store: Store, sessionKey: string) => {
	const defaultKey = (file: string): string => `${sessionKey}:${file}`

	const databaseConn = await caching(store)

	const writeData = async (file: string, data: object) => {
		let ttl: number | undefined = undefined
		if (file === 'creds') {
			ttl = 63115200 // 2 years
		}

		await databaseConn.set(defaultKey(file), JSON.stringify(data, BufferJSON.replacer), ttl)
	}

	const readData = async (file: string): Promise<AuthenticationCreds | null> => {
		try {
			const data = await databaseConn.get(defaultKey(file))

			if (data) {
				return JSON.parse(data as string, BufferJSON.reviver)
			}

			return null
		} catch (error) {
			logger.error(error)
			return null
		}
	}

	const removeData = async (file: string) => {
		try {
			return await databaseConn.del(defaultKey(file))
		} catch {
			logger.error(`Error removing ${file} from session ${sessionKey}`)
		}
	}

	const clearState = async () => {
		try {
			const result = await databaseConn.store.keys(`${sessionKey}*`)
			await Promise.all(result.map(async (key: string) => await databaseConn.del(key)))
		} catch {}
	}

	const creds: AuthenticationCreds = (await readData('creds')) || initAuthCreds()

	return {
		clearState,
		saveCreds: () => writeData('creds', creds),
		state: {
			creds,
			keys: {
				get: async (type: string, ids: string[]) => {
					const data: Record<string, proto.Message.AppStateSyncKeyData | AuthenticationCreds | null> = {}
					await Promise.all(
						ids.map(async id => {
							let value: proto.Message.AppStateSyncKeyData | AuthenticationCreds | null = await readData(
								`${type}-${id}`
							)
							if (type === 'app-state-sync-key' && value) {
								value = proto.Message.AppStateSyncKeyData.fromObject(value)
							}

							data[id] = value
						})
					)

					return data
				},
				set: async (data: Record<string, Record<string, AuthenticationCreds | proto.Message.AppStateSyncKeyData | null>>) => {
					const tasks: Promise<unknown>[] = []
					for (const category in data) {
						for (const id in data[category]) {
							const value = data[category][id]
							const key = `${category}-${id}`
							tasks.push(value ? writeData(key, value) : removeData(key))
						}
					}

					await Promise.all(tasks)
				}
			}
		}
	}
}

export default makeCacheManagerAuthState
