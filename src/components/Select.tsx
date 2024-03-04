import { useEffect, useState } from 'react';
import { Input, InputBase, Combobox, useCombobox } from '@mantine/core';
import { Address, erc20Abi, formatUnits } from 'viem';
import { useReadContracts } from 'wagmi';
import { useAccount } from 'wagmi'

export function Select(props: {
  options: string[],
  onSelect?: (value: Address | undefined) => void,
  disabled?: boolean,
  scopeKey?: string,
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const [value, setValue] = useState<Address | undefined>(undefined);

  const account = useAccount()

  const data = useReadContracts({
    contracts: props?.options.map((o) => {
      return {
        address: o as Address,
        abi: erc20Abi,
        functionName: "symbol",
      }
    }).concat(
      props?.options.map((o) => {
        return {
          address: o as Address,
          abi: erc20Abi,
          functionName: "decimals",
        }
      }).concat(
        account.address ? props?.options.map((o) => {
          return {
            address: o as Address,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [account.address],
            scopeKey: props?.scopeKey,
          }
        }) : []
      )
    )
  })

  const symbols = data?.data?.slice(0, props?.options.length)
  const decimals = data?.data?.slice(props?.options.length, props?.options.length * 2)
  const balances = data?.data?.slice(props?.options.length * 2, props?.options.length * 3)

  const balancesStrs = balances?.map((balance, i) => {
    if (!balance.result || !decimals?.[i].result) {
      return "..."
    }
  
    const d = parseInt(decimals[i].result?.toString() ?? "0", 0)
    return formatUnits(BigInt(balance.result), d)
  })
  
  const options = props?.options.map((item, i) => (
    <Combobox.Option value={item} key={item}>
      {balancesStrs ? balancesStrs[i] : "..."} {symbols ? symbols[i].result?.toString() : "..."} {item}
    </Combobox.Option>
  ));

  useEffect(() => {
    props?.onSelect && props.onSelect(value)
  }, [value])

  return (
    <Combobox
      store={combobox}
      disabled={props?.options.length === 0 || props?.disabled}
      onOptionSubmit={(val) => {
        setValue(val as Address);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          label="Token"
          component="button"
          type="button"
          pointer
          disabled={props?.options.length === 0 || props?.disabled}
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
        >
          {value || <Input.Placeholder>
            {props?.options.length === 0 ? "Loading tokens..." : "Select token"}
        </Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}