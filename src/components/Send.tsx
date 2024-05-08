import { Badge, Center, Container, Divider, Paper, RangeSlider, Space, TextInput, Title, Text, Button, Transition, Loader, Alert } from "@mantine/core"
import { Select } from "./Select"
import { useMemo, useState } from "react"
import { useAccount, useClient, useEstimateFeesPerGas, useReadContract, useSignTypedData } from 'wagmi'
import { Address, encodeFunctionData, encodePacked, erc20Abi, formatGwei, formatUnits, isAddress, keccak256, parseUnits, zeroAddress } from 'viem'
import { useQuery } from "@tanstack/react-query"
import { Bundler, SendOperationArgs, SendOperationReturn } from "../clients/Bundler.proto"
import { HANDLER_ABI } from "../contracts/Handler"
import { notifications } from '@mantine/notifications'
import { ethers } from 'ethers'
import { watchContractEvent } from '@wagmi/core'
import { config } from "../providers/Web3Provider"
import { Config } from "../Config"
import { IconInfoCircle } from '@tabler/icons-react'

const bundlerClient = new Bundler(Config.BUNDLER_URL, fetch)

export function Send() {
  const [warning, setWarning] = useState(true)
  const [cacheKey, setCacheKey] = useState("")
  const [token, setToken] = useState<Address | undefined>()
  const [to, setTo] = useState<string>("")
  const [val, setVal] = useState<string>()
  const [range, setRange] = useState<[number, number]>([0.01, 0.20])
  const [sending, setSending] = useState(false)
  const client = useClient()
  const { signTypedDataAsync } = useSignTypedData()
  const account = useAccount()

  const { data: feeAsks } = useQuery({
    queryKey: ['feeAsks'],
    queryFn: () => bundlerClient.feeAsks()
  })

  const symbol = useReadContract({
    abi: erc20Abi,
    address: token,
    functionName: 'symbol'
  })

  const name = useReadContract({
    abi: erc20Abi,
    address: token,
    functionName: 'name'
  })

  const decimals = useReadContract({
    abi: erc20Abi,
    address: token,
    functionName: 'decimals'
  })

  const balance = useReadContract({
    abi: erc20Abi,
    address: token,
    functionName: 'balanceOf',
    args: [account?.address ?? zeroAddress],
    scopeKey: cacheKey
  })

  const nonce = useReadContract({
    abi: [{
      "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
      "name": "nonces",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }],
    address: token,
    functionName: 'nonces',
    args: [account?.address ?? zeroAddress],
    scopeKey: cacheKey
  })


  const invalidateCache = () => {
    setCacheKey(Date.now().toString())
  }

  const feerange1 = range[0] ** 2
  const feerange2 = range[1] ** 2

  const estimateGas = useEstimateFeesPerGas()
  const baseFeeStr = estimateGas.data ? formatGwei(estimateGas.data.maxFeePerGas) : '...'
  const acceptedTokens = Object.keys(feeAsks?.feeAsks.acceptedTokens ?? {})

  const valRaw = val && decimals.data && parseUnits(val, decimals.data)
  const errTo = useMemo(() => (to && !isAddress(to)) && "Invalid address" || undefined, [to])
  const errVal = valRaw && balance.data && valRaw > balance.data && "Insufficient balance" || undefined

  let tokScaling: bigint | undefined = undefined
  let tokNormalization: bigint | undefined = undefined

  if (token && feeAsks?.feeAsks.acceptedTokens[token]) {
    tokScaling = BigInt(feeAsks.feeAsks.acceptedTokens[token].scalingFactor)
    tokNormalization = BigInt(feeAsks.feeAsks.acceptedTokens[token].normalizationFactor)

    // Bump the fee by 1% so there is some room
    // for the price to move
    tokScaling = (tokScaling * 105n) / 100n

    // Convert it so tokNormalization becomes 1e18
    tokScaling = (tokScaling * 10n ** 18n) / tokNormalization
    tokNormalization = 10n ** 18n
  }

  // Priority fee is determined by the min fee range divided by the gas limit
  const minTokenFeeIn = decimals.data && BigInt(Math.ceil(feerange1 * 10 ** decimals.data))
  const maxTokenFeeIn = decimals.data && BigInt(Math.ceil(feerange2 * 10 ** decimals.data))

  const minTokenPerGasEth = tokNormalization && minTokenFeeIn && tokScaling && (
    (minTokenFeeIn * tokNormalization) / (tokScaling * BigInt(Config.GAS_LIMIT))
  )

  const maxTokenPerGasEth = tokNormalization && maxTokenFeeIn && tokScaling && (
    (maxTokenFeeIn * tokNormalization) / (tokScaling * BigInt(Config.GAS_LIMIT))
  )

  const maxCost = valRaw && maxTokenPerGasEth && tokScaling && tokNormalization && valRaw + (
    (BigInt(Config.GAS_LIMIT) * maxTokenPerGasEth * tokScaling) / tokNormalization
  )

  const ready = !(
    token &&
    errTo === undefined &&
    errVal === undefined &&
    valRaw &&
    maxCost &&
    to &&
    balance.data &&
    balance.data > maxCost &&
    !sending
  )

  const send = async () => {
    if (sending) return
    setSending(true)

    try {
      // Deadline is 600 seconds from now
      const deadline = Math.floor(Date.now() / 1000) + 600

      const ophash = keccak256(
        encodePacked(
          [
            "address",
            "address",
            "address",
            "uint256",
            "uint256",
            "uint256",
            "uint256",
            "uint256",
            "uint256"
          ],
          [
            token!,
            account.address!,
            to as `0x${string}`,
            valRaw as bigint,
            BigInt(deadline),
            maxTokenPerGasEth as bigint,
            minTokenPerGasEth as bigint,
            tokScaling as bigint,
            BigInt(Config.GAS_LIMIT),
          ]
        )
      )

      const signature = await signTypedDataAsync({
        domain: { 
          name: name.data!, 
          version: '2', 
          chainId: Config.CHAIN_ID,
          verifyingContract: token, 
        }, 
        types: {
          Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: 'Permit',
        message: {
          owner: account.address!,
          spender: Config.HANDLER_ADDRESS,
          value: maxCost as bigint,
          nonce: nonce.data!,
          deadline: ethers.toBigInt(ophash),
        }
      })

      const { r, s, v } = ethers.Signature.from(signature)

      const data = encodeFunctionData({
        abi: HANDLER_ABI,
        functionName: 'doTransfer',
        args: [
          token,
          account.address,
          to,
          valRaw,
          deadline,
          minTokenPerGasEth,
          maxTokenPerGasEth,
          tokScaling,
          Config.GAS_LIMIT,
          r,
          s,
          v
        ]
      })

      const res = await fetch(Config.BUNDLER_URL + '/rpc/Bundler/SendOperation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: {
            entrypoint: Config.HANDLER_ADDRESS,
            data: data,
            endorser: Config.ENDORSER_ADDRESS,
            endorserCallData: "0x",
            endorserGasLimit: "10000000",
            gasLimit: Config.GAS_LIMIT!.toString(),
            fixedGas: "0",
            maxFeePerGas: maxTokenPerGasEth!.toString(),
            maxPriorityFeePerGas: minTokenPerGasEth!.toString(),
            feeToken: token,
            feeScalingFactor: tokScaling!.toString(),
            feeNormalizationFactor: tokNormalization!.toString(),
            hasUntrustedContext: false,
            chainId: Config.CHAIN_ID.toString(),
          }
        } as SendOperationArgs)
      })

      const json = await res.json()

      if (res.status === 400) {
        notifications.show({
          title: 'Failed to send operation',
          message: json.cause,
          color: 'red'
        })
      } else {
        const opJson = json as SendOperationReturn
        const sent = notifications.show({
          pending: true,
          autoClose: false,
          title: 'Sending operation',
          message: opJson.operation,
          color: 'blue',
          loading: true,
        })

        // FirQe and forget the transfer watcher
        waitForTransfer(() => {
          notifications.hide(sent)
        }, token as Address, to as Address, valRaw as bigint)

      }
    } catch (e) {
      notifications.show({
        title: 'Error sending operation',
        message: (e as Error).message ?? 'Unknown error',
        color: 'red',
      })
      console.error(e)
    }

    invalidateCache()
    setSending(false)
  }

  const waitForTransfer = (pending: () => void, token: Address, to: Address, val: bigint): () => void => {
    if (!client || !token) return function () {}

    // Try to find an event that matches the transfer
    let canceled = false

    const unwatch = watchContractEvent(config, {
      abi: erc20Abi,
      address: token,
      poll: true,
      pollingInterval: 500,
      eventName: 'Transfer',
      args: {
        from: account.address,
        to: to
      },
      onLogs: (logs) => {
        for (const log of logs) {
          if (log.args.value === val) {
            canceled = true
            pending()
            invalidateCache()
            notifications.show({
              title: 'Transfer confirmed',
              message: `${log.transactionHash}`,
              color: 'green'
            })
          }
        }

        unwatch()
      }
    })

    // If the transfer is not found in 30 seconds, timeout and show warning
    setTimeout(() => {
      if (canceled) return
      unwatch()
      pending()
      notifications.show({
        title: 'Transfer timeout',
        message: `${val} ${token} to ${to} not confirmed after 30 seconds`,
        color: 'yellow'
      })
      invalidateCache()
    }, 30000)

    return () => {
      canceled = true
      unwatch()
    }
  }

  return (
    <Center>
      <Paper shadow="lg" radius="lg" withBorder p="xl" w="32rem">
        <Container size="xs">
          <Title order={3}>
            Send ERC20 tokens
          </Title>
          <Space h="xs" />
          <Divider />
          <Space h="lg" />
          {warning && <Alert variant="light" color="yellow" withCloseButton title="Alpha Code" icon={<IconInfoCircle />} onClose={() => setWarning(false)} mb="md">
            This project is built as a demo for an ERC-5189 & ERC-20 integration. It is in alpha stages and not intended for production use.
          </Alert>}
          <Select
            options={acceptedTokens}
            onSelect={(a) => setToken(a)}
            disabled={sending}
            scopeKey={cacheKey}
            />
          <Space h="sm" />
          <TextInput
            label="Destination address"
            placeholder="0xc0ff...4979"
            defaultValue={to}
            disabled={sending}
            onChange={(e) => setTo(e.currentTarget.value)}
            error={errTo}
          />
          <Space h="sm" />
          <TextInput
            type="number"
            label="Amount"
            placeholder="0.00"
            rightSectionWidth={80}
            defaultValue={val}
            disabled={sending}
            error={errVal}
            onChange={(e) => setVal(e.currentTarget.value)}
            rightSection={<Transition
              mounted={symbol.data !== undefined}
              transition="fade"
              duration={400}
              timingFunction="ease"
            >
              {(s) => (
                <Badge color={sending ? "gray" : undefined} style={s}>{symbol.data || ""}</Badge>
              )}
            </Transition>}
          />
          <Space h="sm" />
          <Text size="sm">Fee</Text>
          <RangeSlider
            minRange={0.2}
            min={0}
            max={10}
            scale={(v) => v ** 2 }
            step={0.01}
            value={range}
            onChange={(value) => { setRange(value) }}
            label={(value) => `${value} USDC`}
            defaultValue={[0.01, 0.20]}
            disabled={!symbol || sending}
            />
          <Space h="lg" />
          <Divider variant="dashed" label="Summary" />
          <Space h="sm" />
          <Text c="dimmed">Sending: {val} {symbol.data ? symbol.data : "???"}</Text>
          <Text c="dimmed">Destination: {errTo || !to ? "..." : `${to?.slice(0, 6)}...${to?.slice(-4)}`}</Text>
          <Text c="dimmed">Current base fee: {baseFeeStr} GWEI</Text>
          <Text c="dimmed">Max basefee: {maxTokenPerGasEth ? formatGwei(maxTokenPerGasEth) : '...'} GWEI</Text>
          <Text c="dimmed">Priority fee: {minTokenPerGasEth ? formatGwei(minTokenPerGasEth) : '...'} GWEI</Text>
          <Text c="dimmed">Fee range: {feerange1.toFixed(2)} - {feerange2.toFixed(2)} USDC</Text>
          <Text c="dimmed">Balance: {balance.data != undefined && decimals.data ? formatUnits(balance.data, decimals.data) : "..."} {symbol.data ? symbol.data : "..."}</Text>
          <Text c="dimmed">Required balance: {maxCost && decimals.data && formatUnits(maxCost, decimals.data) || "..."} {symbol.data ? symbol.data : "..."}</Text>
          <Space h="sm" />
          <Divider variant="dashed" label="Summary" />
          <Space h="lg" />
          <Button disabled={ready} onClick={() => send()} fullWidth>
            {sending ? <Loader color="gray" size="md" type="dots" /> : 'Send' }
          </Button>
        </Container>
      </Paper>
    </Center>
  )
}
