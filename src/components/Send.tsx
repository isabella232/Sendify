import { Badge, Center, Container, Divider, Paper, RangeSlider, Space, TextInput, Title, Text, Button, Transition } from "@mantine/core";
import { Select } from "./Select";
import { useMemo, useState } from "react";
import { useAccount, useEstimateFeesPerGas, useReadContract } from 'wagmi'
import { Address, erc20Abi, formatGwei, formatUnits, isAddress, parseUnits, zeroAddress } from 'viem'
import { useQuery } from "@tanstack/react-query";
import { Bundler } from "../clients/Bundler.proto";

const BUNDLER_URL = 'http://localhost:3000'

const GAS_LIMIT = 120000
const bundlerClient = new Bundler(BUNDLER_URL, fetch)

export function Send() {
  const [token, setToken] = useState<Address | undefined>()
  const [to, setTo] = useState<string>()
  const [val, setVal] = useState<string>()
  const [range, setRange] = useState<[number, number]>([0.01, 0.20])

  const feerange1 = range[0] ** 2
  const feerange2 = range[1] ** 2

  const account = useAccount()

  const estimateGas = useEstimateFeesPerGas()
  const baseFeeStr = estimateGas.data ? formatGwei(estimateGas.data.maxFeePerGas) : '...'

  const { data: feeAsks } = useQuery({
    queryKey: ['feeAsks'],
    queryFn: () => bundlerClient.feeAsks()
  })

  const acceptedTokens = Object.keys(feeAsks?.feeAsks.acceptedTokens ?? {})

  const symbol = useReadContract({
    abi: erc20Abi,
    address: token,
    functionName: 'symbol'
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
    args: [account?.address ?? zeroAddress]
  })

  const valRaw = val && decimals.data && parseUnits(val, decimals.data)
  const errTo = useMemo(() => (to && !isAddress(to)) && "Invalid address", [to])
  const errVal = valRaw && balance.data && valRaw > balance.data && "Insufficient balance" || undefined

  var tokScaling: bigint | undefined = undefined
  var tokNormalization: bigint | undefined = undefined

  if (token && feeAsks?.feeAsks.acceptedTokens[token]) {
    tokScaling = BigInt(feeAsks.feeAsks.acceptedTokens[token].scalingFactor)
    tokNormalization = BigInt(feeAsks.feeAsks.acceptedTokens[token].normalizationFactor)

    // Bump the fee by 1% so there is some room
    // for the price to move
    // By increasing both values we can avoid loss of precision
    tokScaling *= 101n
    tokNormalization *= 100n
  }

  // Priority fee is determined by the min fee range divided by the gas limit
  const minTokenFee = decimals.data && feerange1 * 10 ** decimals.data
  const maxTokenFee = decimals.data && feerange2 * 10 ** decimals.data
  const priorityFee = minTokenFee && BigInt(Math.ceil(minTokenFee / GAS_LIMIT))

  // We can convert the priority fee (in tokens) to ETH by using the fee ask rate
  const priorityFeeEth = (
    priorityFee && tokScaling && tokNormalization ? (
      (tokScaling * priorityFee) / tokNormalization
    ) : undefined
  )

  const maxBaseFee = maxTokenFee !== undefined && BigInt(Math.ceil(maxTokenFee / GAS_LIMIT))
  const maxBaseFeeEth = (
    maxBaseFee && tokScaling && tokNormalization ? (
      (tokScaling * maxBaseFee) / tokNormalization
    ) : undefined
  )

  const maxCost = valRaw && maxTokenFee && valRaw + BigInt(Math.ceil(maxTokenFee))

  const ready = !(
    token &&
    errTo === undefined &&
    errVal === undefined
  )

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
          <Select options={acceptedTokens} onSelect={(a) => setToken(a)} />
          <Space h="sm" />
          <TextInput
            label="Destination address"
            placeholder="0xc0ff...4979"
            value={to}
            onChange={(e) => setTo(e.currentTarget.value)}
            error={errTo}
          />
          <Space h="sm" />
          <TextInput
            label="Amount"
            placeholder="0.00"
            rightSectionWidth={80}
            value={val}
            error={errVal}
            onChange={(e) => setVal(e.currentTarget.value)}
            rightSection={<Transition
              mounted={symbol.data !== undefined}
              transition="fade"
              duration={400}
              timingFunction="ease"
            >
              {(s) => (
                <Badge style={s}>{symbol.data || ""}</Badge>
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
            disabled={!symbol}
            />
          <Space h="lg" />
          <Divider variant="dashed" label="Summary" />
          <Space h="sm" />
          <Text c="dimmed">Sending: {val} {symbol.data ? symbol.data : "???"}</Text>
          <Text c="dimmed">Destination: {errTo || !to ? "..." : `${to?.slice(0, 6)}...${to?.slice(-4)}`}</Text>
          <Text c="dimmed">Current base fee: {baseFeeStr} GWEI</Text>
          <Text c="dimmed">Max basefee: {maxBaseFeeEth ? formatGwei(maxBaseFeeEth) : '...'} GWEI</Text>
          <Text c="dimmed">Priority fee: {priorityFeeEth ? formatGwei(priorityFeeEth) : '...'} GWEI</Text>
          <Text c="dimmed">Fee range: {feerange1.toFixed(2)} - {feerange2.toFixed(2)} USDC</Text>
          <Text c="dimmed">Balance: {balance.data && decimals.data ? formatUnits(balance.data, decimals.data) : "..."} {symbol.data ? symbol.data : "..."}</Text>
          <Text c="dimmed">Required balance: {maxCost && decimals.data && formatUnits(maxCost, decimals.data) || "..."} {symbol.data ? symbol.data : "..."}</Text>
          <Space h="sm" />
          <Divider variant="dashed" label="Summary" />
          <Space h="lg" />
          <Button disabled={ready} fullWidth>Send</Button>
        </Container>
      </Paper>
    </Center>
  )
}
