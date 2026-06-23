'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'

const buttonClass =
  'rounded-lg border px-4 py-2 transition active:scale-95 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50'

export function ConnectWallet() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const { connect, connectors, error } = useConnect()
  const { disconnect } = useDisconnect()

  if (isReconnecting) return <div className="animate-pulse">Reconnecting...</div>

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-2">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              disabled={isConnecting}
              className={buttonClass}
            >
              {isConnecting ? 'Connecting...' : `Connect ${connector.name}`}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error.message}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="rounded bg-gray-100 px-3 py-1 font-mono text-sm">
        Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
      </span>

      <button onClick={() => disconnect()} className={buttonClass}>
        Disconnect
      </button>
    </div>
  )
}