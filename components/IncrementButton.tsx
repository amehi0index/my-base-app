'use client'

import { useEffect } from 'react'
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain,
} from 'wagmi'
import { readContractQueryOptions } from 'wagmi/query'
import { useQueryClient } from '@tanstack/react-query'
import { baseSepolia } from 'wagmi/chains'
import { config } from '@/config/wagmi'
import { COUNTER_ADDRESS, counterAbi } from '@/config/counter'

const buttonClass =
  'rounded-lg border px-5 py-3 font-medium transition active:scale-95 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50'

export function IncrementButton() {
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const { data: hash, isPending, writeContract, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash })
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({
        queryKey: readContractQueryOptions(config, {
          address: COUNTER_ADDRESS,
          abi: counterAbi,
          functionName: 'number',
          chainId: baseSepolia.id,
        }).queryKey,
      })
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
          ? 'Open wallet to confirm...'
          : isConfirming
          ? 'Confirming onchain...'
          : 'Increment'}
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