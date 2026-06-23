export const COUNTER_ADDRESS = '0x32A000789159035Ed5E27b2C60dfAa1410f81B01' as const

export const counterAbi = [
  {
    type: 'function',
    name: 'number',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'increment',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const