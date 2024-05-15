# End to End Configuration Guide

To run an entire ERC-5189 and ERC-20 integration demo, you will need to set up the following components:

* [Sendify Frontend](../README.md)
* [Handler and Endorser Contracts](https://github.com/0xsequence/ERC5189-ERC20-Handler)
* [ERC-5189 Bundler and Registry](https://github.com/0xsequence/bundler)

This guide will walk you through the process of setting up each component and running the demo locally.

## Handler and Endorser Contracts

The Endoser and Handler have already been deployed and configured to support USDC on Arbitrum. The contracts are available at the following addresses:

* Handler: `0x8e535B04d85661648Aa28442d5AE6C33A2cEF5e6`
* Endorser: `0x7BBF728Ce07B78297bc4aB6fF9ae9BB4B50b3892`

Alternatively, follow the steps in the README to deploy, configure and register your own instances.

## ERC-5189 Bundler and IPFS

Configure and run an IPFS node (outside the scope of this document).

Configure the bundler. The example configuration below uses a single sender to accept USDC on Arbitrum. Update the values as required for your use case.

```conf
mnemonic = "" # Update this

rpc_port = 3000

[p2p]
  p2p_port = 0

  boot_nodes = [
    "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
    "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
    "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
    "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
    "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
  ]

[debugger]
  mode = "none" # Not required for Sendify

[endorser_registry]
  MinReputation = 0
  TempBanSeconds = 86400

  [[endorser_registry.sources]]
    Weight = 1
    Address = "0xcd4e127B83E6A170195e6A561EaB02406ec8B941"

[collector]
  min_priority_fee = 2500000

  [[collector.references]]
    token = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"

  [collector.references.uniswap_v2]
    pool = "0xF64Dfe17C8b87F012FCf50FbDA1D62bfA148366a"
    base_token = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"

[senders]
  num_senders = 1
  random_wait = 1000
  sleep_wait  = 1000
  min_balance = "10000000000000000"

[network]
  ipfs_url = "http://localhost:5001" # Update this
  rpc_url = "https://nodes.sequence.app/arbitrum" # Update this
  validator_contract = "0x9b75CCC67e786CD6E41956d8Ae8B866Aaa2E15f7"

[mempool]
  max_size = 1000

[endorser_registry]
  min_reputation = 0 # Update this

[logging]
  service       = "bundler"
  level         = "DEBUG"
  # json          = true
  concise       = true
  req_headers   = false
  resp_headers  = false
  # source        = "source"
```

Run the bundler.

## Configure Sendify

Copy `.env.sample` to `.env` and update the following values:

```bash
VITE_HANDLER_ADDRESS=0x8e535B04d85661648Aa28442d5AE6C33A2cEF5e6
VITE_ENDORSER_ADDRESS=0x7BBF728Ce07B78297bc4aB6fF9ae9BB4B50b3892

VITE_BUNDLER_URL= # Your bundler URL
VITE_NODE_URL=https://nodes.sequence.app/arbitrum # Update this
VITE_CHAIN_ID=42161

VITE_GAS_LIMIT=160000
```

Run the front end.
