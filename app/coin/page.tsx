"use client";
import { mnemonicToSeedSync } from 'bip39';
import React, { useEffect, useState } from 'react'

const Page = () => {
  const [network, setNetwork] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [solKey, setSolKey] = useState<string | null>(null);
  const [btcKey, setBtcKey] = useState<string | null>(null);
  const [ethKey, setEthKey] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  useEffect(() => {
    if(typeof window !== 'undefined'){
      const network = localStorage.getItem('network') || 'sol';
      const solKey = localStorage.getItem('solKey') || null;
      const btcKey = localStorage.getItem('btcKey') || null;
      const ethKey = localStorage.getItem('ethKey') || null;
      const secretKey = localStorage.getItem('secretKey') || null;

      setNetwork(network);
      setSolKey(solKey);
      setBtcKey(btcKey);
      setEthKey(ethKey);
      setSecretKey(secretKey);
    }
    setInterval(() => {
      setIsLoading(true);
    },300);
  },[])


  const handleCreatePair = async () => {
    if(network==='sol'){
      const seed = mnemonicToSeedSync(secretKey || '');
      const i = solKey?.length || 0;
      const path = `m/44'/501'/${i}'/0`;
      const derivePath = hdkeyToAccount(hdKey, path);
    }
  }
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1>Hello {network}</h1>
    </div>
  )
}

export default Page;