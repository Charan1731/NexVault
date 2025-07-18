"use client";
import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation';

const Home = () => {
  const router = useRouter();
  const handleClick = async (chain:'sol'|'btc'|'eth') => {
    localStorage.setItem('network',chain);
    router.push('/coin')
  }

  const handleImport = () => {
    router.push('/import')
  }
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-[60px] font-bold text-center font-sans'>Create your own Web3<br></br><span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'>Hierarchical Deterministic Wallet&apos;s</span></h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400 font-semibold">
        Secure and scalable wallets supporting multiple blockchains.
      </p>
      <div className='flex justify-center flex-wrap gap-4 mt-5'>
      <Button aria-label="Explore Solana support" className='p-6 bg-black text-white hover:cursor-pointer dark:bg-white dark:text-black' onClick={() => handleClick('sol')}>
        Solana
      </Button>
      <Button aria-label="Explore Bitcoin support" className='p-6 bg-black text-white hover:cursor-pointer dark:bg-white dark:text-black' onClick={() => handleClick('btc')}>
        Bitcoin
      </Button>
      <Button aria-label="Explore Ethereum support" className='p-6 bg-black text-white hover:cursor-pointer dark:bg-white dark:text-black' onClick={() => handleClick('eth')}>
        Ethereum
      </Button>
      </div>
      <div className='flex flex-col items-center justify-center'>
        <Button aria-label="Explore Ethereum support" className='p-6 mt-5 bg-black text-white hover:cursor-pointer dark:bg-white dark:text-black' onClick={() => handleImport()}>
         Import Wallet
        </Button>
      </div>
    </div>
  )
}

export default Home