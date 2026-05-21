'use client';

import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { createPublicClient, http, parseUnits, formatUnits, keccak256, encodePacked } from 'viem';
import { activeChain } from '@/lib/chain';
import {
  ESCROW_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
  ESCROW_ABI,
  ERC20_ABI,
  USDT_DECIMALS,
} from '@/lib/contracts';
import { sendLegacyContractTx } from '@/lib/tx';
import { saveOrder } from '@/lib/store';
import { formatThb, usdtToThb } from '@/lib/currency';

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
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('');
  const [error, setError] = useState('');
  const [usdtBalance, setUsdtBalance] = useState<number | null>(null);
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    const wallet = wallets[0];
    if (!wallet || !authenticated) { setUsdtBalance(null); return; }
    const publicClient = createPublicClient({
      chain: activeChain,
      transport: http(activeChain.rpcUrls.default.http[0]),
    });
    publicClient.readContract({
      address: USDT_CONTRACT_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [wallet.address as `0x${string}`],
    }).then((bal) => {
      setUsdtBalance(parseFloat(formatUnits(bal as bigint, USDT_DECIMALS)));
    }).catch(() => {});
  }, [wallets, authenticated]);

  const handleMint = async () => {
    const wallet = wallets[0];
    if (!wallet) return;
    setMinting(true);
    setError('');
    try {
      await wallet.switchChain(activeChain.id);
      const provider = await wallet.getEthereumProvider();
      const publicClient = createPublicClient({
        chain: activeChain,
        transport: http(activeChain.rpcUrls.default.http[0]),
      });
      const tx = await sendLegacyContractTx({
        provider,
        from: wallet.address,
        to: USDT_CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'mint',
        args: [wallet.address, parseUnits('1000', USDT_DECIMALS)],
        gas: 100_000n,
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });
      setUsdtBalance((prev) => (prev ?? 0) + 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Mint failed: ${msg}`);
    } finally {
      setMinting(false);
    }
  };

  const handleBuy = async () => {
    if (!authenticated) { router.push('/auth'); return; }
    const wallet = wallets[0];
    if (!wallet) { setError('No wallet connected.'); return; }

    setLoading(true);
    setError('');
    try {
      await wallet.switchChain(activeChain.id);
      const provider = await wallet.getEthereumProvider();
      const publicClient = createPublicClient({
        chain: activeChain,
        transport: http(activeChain.rpcUrls.default.http[0]),
      });

      const amount = parseUnits(priceUsdt.toFixed(6), USDT_DECIMALS);
      const orderId = keccak256(
        encodePacked(
          ['address', 'string', 'uint256'],
          [wallet.address as `0x${string}`, listingId, BigInt(Date.now())]
        )
      );

      setStep('Approving payment...');
      const approveTx = await sendLegacyContractTx({
        provider,
        from: wallet.address,
        to: USDT_CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [ESCROW_CONTRACT_ADDRESS, amount],
        gas: 80_000n,
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTx });

      setStep('Locking funds in escrow...');
      const orderTx = await sendLegacyContractTx({
        provider,
        from: wallet.address,
        to: ESCROW_CONTRACT_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'createOrder',
        args: [orderId, sellerWallet, amount],
        gas: 200_000n,
      });
      await publicClient.waitForTransactionReceipt({ hash: orderTx });

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
        autoReleaseAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });

      router.push(`/orders/${orderId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transaction failed.');
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  const needsFunds = authenticated && usdtBalance !== null && usdtBalance < priceUsdt;

  return (
    <div className="space-y-2">
      {needsFunds && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-800">Not enough test USDT</p>
            <p className="text-xs text-amber-600 mt-0.5">
              You have {usdtBalance!.toFixed(2)} USDT · need {priceUsdt.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleMint}
            disabled={minting}
            className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
          >
            {minting ? 'Minting…' : 'Get 1000 USDT'}
          </button>
        </div>
      )}
      <button
        onClick={handleBuy}
        disabled={loading || needsFunds}
        className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading
          ? (step || 'Processing...')
          : authenticated
          ? `Buy · ${formatThb(usdtToThb(priceUsdt))}`
          : 'Sign in to Buy'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-gray-400 text-center">
        🔒 Payment locked in KUB Chain escrow until delivery confirmed
      </p>
    </div>
  );
}
