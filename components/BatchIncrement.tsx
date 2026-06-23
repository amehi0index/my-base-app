'use client'

import { useEffect } from 'react'
import {
  useSendCalls,
  useWaitForCallsStatus,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
  useSwitchChain,
} from 'wagmi'
import { readContractQueryOptions } from 'wagmi/query'
import { useQueryClient } from '@tanstack/react-query'
import { encodeFunctionData } from 'viem'
import { baseSepolia } from 'wagmi/chains'
import { config } from '@/config/wagmi'
import { useWalletCapabilities } from '@/hooks/useWalletCapabilities'
import { COUNTER_ADDRESS, counterAbi } from '@/config/counter'

const buttonClass =
  'rounded-lg border px-5 py-3 font-medium transition active:scale-95 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50'

const counterQueryKey = readContractQueryOptions(config, {
  address: COUNTER_ADDRESS,
  abi: counterAbi,
  functionName: 'number',
  chainId: baseSepolia.id,
}).queryKey

export function BatchIncrement() {
  const { isConnected } = useAccount()
  const { supportsBatching } = useWalletCapabilities()

  if (!isConnected) return <p className="text-sm text-gray-500">Connect your wallet first.</p>

  return supportsBatching ? <BatchFlow /> : <SequentialFlow />
}

function BatchFlow() {
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const { data, sendCalls, isPending, error } = useSendCalls()
  const { isLoading: isConfirming, isSuccess } = useWaitForCallsStatus({
    id: data?.id,
  })
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: counterQueryKey })
    }
  }, [isSuccess, queryClient])

  if (chainId !== baseSepolia.id) {
    return (
      <button
        onClick={() => switchChain({ chainId: baseSepolia.id })}
        disabled={isSwitching}
        className={buttonClass}
      >
        {isSwitching ? 'Switching network...' : 'Switch to Base Sepolia'}
      </button>
    )
  }

  const incrementData = encodeFunctionData({
    abi: counterAbi,
    functionName: 'increment',
  })

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={() =>
          sendCalls({
            calls: [
              { to: COUNTER_ADDRESS, data: incrementData },
              { to: COUNTER_ADDRESS, data: incrementData },
            ],
            chainId: baseSepolia.id,
          })
        }
        disabled={isPending || isConfirming}
        className={buttonClass}
      >
        {isPending
          ? 'Confirm batch in wallet...'
          : isConfirming
          ? 'Confirming batch...'
          : 'Increment x2 Batch'}
      </button>

      {isSuccess && <p className="text-sm text-green-600">Batch confirmed!</p>}
      {error && <p className="max-w-md text-center text-sm text-red-600">{error.message}</p>}
    </div>
  )
}

function SequentialFlow() {
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const { data: hash, isPending, writeContract, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash })
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: counterQueryKey })
    }
  }, [isSuccess, queryClient])

  if (chainId !== baseSepolia.id) {
    return (
      <button
        onClick={() => switchChain({ chainId: baseSepolia.id })}
        disabled={isSwitching}
        className={buttonClass}
      >
        {isSwitching ? 'Switching network...' : 'Switch to Base Sepolia'}
      </button>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={() =>
          writeContract({
            address: COUNTER_ADDRESS,
            abi: counterAbi,
            functionName: 'increment',
            chainId: baseSepolia.id,
          })
        }
        disabled={isPending || isConfirming}
        className={buttonClass}
      >
        {isPending
          ? 'Confirm in wallet...'
          : isConfirming
          ? 'Confirming...'
          : 'Increment Fallback'}
      </button>

      {isSuccess && <p className="text-sm text-green-600">Confirmed!</p>}
      {error && <p className="max-w-md text-center text-sm text-red-600">{error.message}</p>}

      {hash && (
        <a
          href={`https://sepolia.basescan.org/tx/${hash}`}
          target="_blank"
          className="text-sm underline hover:no-underline"
        >
          View transaction
        </a>
      )}
    </div>
  )
}