import { createClient, type RedisClientType } from "redis"

let client: RedisClientType | null = null

export const initClient = async () => {
	if(!client) {
		try {
			const tempClient: RedisClientType = createClient()

			tempClient.on("connect", () => console.log("Connected"))
			tempClient.on("error", e => console.log("Error connecting: " + e))

			await tempClient.connect()
			client = tempClient
		} catch (e) {
			console.error("Failed to connect Redis client:", e)
			throw e
		}

		console.log("if")
	}

	console.log("else")

	return client
}
