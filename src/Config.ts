console.log(import.meta.env)

export class Config {
	public static readonly HANDLER_ADDRESS = import.meta.env.VITE_HANDLER_ADDRESS || "0x5489C2D7aDe1e504e6DF80338E501e050cEb9945"
	public static readonly ENDORSER_ADDRESS = import.meta.env.VITE_ENDORSER_ADDRESS || "0x227B49B56F1B8159Ed3156c22cF7E2fE4844CB73"

	public static readonly BUNDLER_URL = import.meta.env.VITE_BUNDLER_URL || "https://749e-81-41-169-103.ngrok-free.app"
	public static readonly NODE_URL = import.meta.env.VITE_NODE_URL || "https://nodes.sequence.app/arbitrum/AQAAAAAAAC4rgm7lKiJuy1REFJJ_h7oqGss"
	public static readonly CHAIN_ID = import.meta.env.VITE_CHAIN_ID || 421611

	public static readonly GAS_LIMIT = import.meta.env.VITE_GAS_LIMIT || 160000
}
