'use client';

import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  parseUnits,
  keccak256,
  encodePacked,
} from 'viem';
import { activeChain } from '@/lib/chain';
import {
  ESCROW_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
  ESCROW_ABI,
  ERC20_ABI,
  USDT_DECIMALS,
} from '@/lib/contracts';
import { saveOrder } from '@/lib/store';

export function BuyButton({
  listingId,
  listingTitle,
  listingImage,
  priceUsdt,
  sellerWallet,
}: {
  listingId: string;
  listingTitle: string;
  listingImage: string;
  priceUsdt: number;
  sellerWallet: string;
}) {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('');
  const [error, setError] = useState('');

  const handleBuy = async () => {
    if (!authenticated) {
      login();
      return;
    }
    const wallet = wallets[0];
    if (!wallet) { setError('No wallet connected.'); return; }

    setLoading(true);
    setError('');
    try {
      await wallet.switchChain(activeChain.id);

      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({
        chain: activeChain,
        transport: custom(provider),
        account: wallet.address as `0x${string}`,
      });
      const publicClient = createPublicClient({
        chain: activeChain,
        transport: http(activeChain.rpcUrls.default.http[0]),
      });

      const amount = parseUnits(priceUsdt.toFixed(6), USDT_DECIMALS);

      // Deterministic bytes32 order ID
      const orderId = keccak256(
        encodePacked(
          ['address', 'string', 'uint256'],
          [wallet.address as `0x${string}`, listingId, BigInt(Date.now())]
        )
      );

      // 1. Approve USDT
      setStep('Approving USDT...');
      const approveTx = await walletClient.writeContract({
        address: USDT_CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [ESCROW_CONTRACT_ADDRESS, amount],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTx });

      // 2. Create escrow order
      setStep('Locking funds in escrow...');
      const orderTx = await walletClient.writeContract({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'createOrder',
        args: [orderId as `0x${string}`, sellerWallet as `0x${string}`, amount],
      });
      await publicClient.waitForTransactionReceipt({ hash: orderTx });

      // 3. Persist order metadata locally
      saveOrder({
        id: orderId,
        listingId,
        listingTitle,
        listingImage,
        priceUsdt,
        buyerId: wallet.address,
        buyerWallet: wallet.address,
        sellerId: sellerWallet,
        sellerWallet,
        status: 'paid',
        txHash: orderTx,
        createdAt: new Date().toISOString(),
        autoReleaseAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      });

      router.push(`/orders/${orderId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transaction failed.');
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading
          ? (step || 'Processing...')
          : authenticated
          ? `Buy · ${priceUsdt.toFixed(2)} USDT`
          : 'Sign in to Buy'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-gray-400 text-center">
        🔒 USDT locked in KUB Chain escrow until delivery confirmed
      </p>
    </div>
  );
}
