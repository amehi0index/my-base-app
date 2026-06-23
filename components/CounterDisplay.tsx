'use client'

import { useReadContract } from 'wagmi'
import { COUNTER_ADDRESS, counterAbi } from '@/config/counter'

export function CounterDisplay() {
  const { data, isLoading, error } = useReadContract({
    address: COUNTER_ADDRESS,
    abi: counterAbi,
    functionName: 'number',
  })

  if (isLoading) {
    return <div>Loading counter...</div>
  }

  if (error) {
    return <div>Error loading counter</div>
  }

  return (
    <div className="rounded border px-6 py-4 text-center">
      <div className="text-sm text-gray-500">Current count</div>
      <div className="text-3xl font-bold">{data?.toString() ?? '0'}</div>
    </div>
  )
}