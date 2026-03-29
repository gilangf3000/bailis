import { DEFAULT_CONNECTION_CONFIG, LIGHTWEIGHT_CONNECTION_CONFIG } from '../Defaults'
import type { UserFacingSocketConfig } from '../Types'
import { makeCommunitiesSocket } from './communities'

// export the last socket layer
const makeWASocket = (config: UserFacingSocketConfig) => {
	const newConfig = {
		...DEFAULT_CONNECTION_CONFIG,
		...LIGHTWEIGHT_CONNECTION_CONFIG,
		...config
	}

	return makeCommunitiesSocket(newConfig)
}

// kept for backwards compatibility; now same baseline as makeWASocket
const makeWASocketLite = (config: UserFacingSocketConfig) => {
	return makeWASocket(config)
}

export default makeWASocket
export { makeWASocketLite }
