import { WagmiProvider, createConfig, http } from "wagmi"
import { arbitrum } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConnectKitProvider, getDefaultConfig } from "connectkit"
import { Config } from "../Config"

export const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [arbitrum],
    transports: {
      // RPC URL for each chain
      [arbitrum.id]: http(Config.NODE_URL),
    },

    // Required API Keys
    walletConnectProjectId: "",

    // Required App Info
    appName: "Sendify",

    // Optional App Info
    appDescription: "Sendify lets you send tokens without ETH!",
    appUrl: "https://sendify.eth",
    appIcon: "https://sendify.eth/logo.png",
  }),
)

const queryClient = new QueryClient()

export const Web3Provider = ({ children }: { children: any }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
