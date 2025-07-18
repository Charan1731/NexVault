"use client";
import { Keypair } from '@solana/web3.js';
import { mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import React, { useEffect, useState } from 'react'
import nacl from 'tweetnacl';

const Page = () => {
  const [network, setNetwork] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [solKey, setSolKey] = useState<string | null>(null);
  const [btcKey, setBtcKey] = useState<string | null>(null);
  const [ethKey, setEthKey] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [isOpen,setIsOpen] = useState<boolean>(false);
  useEffect(() => {
    if(typeof window !== 'undefined'){
      const network = localStorage.getItem('network') || 'sol';
      const solKey = localStorage.getItem('solKey') || null;
      const btcKey = localStorage.getItem('btcKey') || null;
      const ethKey = localStorage.getItem('ethKey') || null;
      const secretKey = localStorage.getItem('secretKey') || null;


      if(!secretKey){
        setIsOpen(true);
      }

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
      const derivedPath = derivePath(path,seed.toString("hex")).key;
      const secret = nacl.sign.keyPair.fromSeed(seed).secretKey;
      const publicKey = Keypair.fromSecretKey(secret).publicKey.toBase58();

      const prevSolKeys = solKey ? JSON.parse(solKey) as string[] : [];
      const updatedSolKeys = [...prevSolKeys, publicKey];
      setSolKey(JSON.stringify(updatedSolKeys));
      localStorage.setItem('solKey', JSON.stringify(updatedSolKeys));
    }
    if(network==='btc'){
      const seed = mnemonicToSeedSync(secretKey || '');
      const i = btcKey?.length || 0;
      const path = `m/44'/0'/${i}'/0`;
      const derivedPath = derivePath(path,seed.toString("hex")).key;
      const secret = nacl.sign.keyPair.fromSeed(seed).secretKey;
      const publicKey = Keypair.fromSecretKey(secret).publicKey.toBase58();

      const prevBtcKeys = btcKey ? JSON.parse(btcKey) as string[] : [];
      const updatedBtcKeys = [...prevBtcKeys, publicKey];
      setBtcKey(JSON.stringify(updatedBtcKeys));
      localStorage.setItem('btcKey', JSON.stringify(updatedBtcKeys));
    }
    if(network==='eth'){
      const seed = mnemonicToSeedSync(secretKey || '');
      const i = ethKey?.length || 0;
      const path = `m/44'/60'/${i}'/0`;
      const derivedPath = derivePath(path,seed.toString("hex")).key;
      const secret = nacl.sign.keyPair.fromSeed(seed).secretKey;
      const publicKey = Keypair.fromSecretKey(secret).publicKey.toBase58();

      const prevEthKeys = ethKey ? JSON.parse(ethKey) as string[] : [];
      const updatedEthKeys = [...prevEthKeys, publicKey];
      setEthKey(JSON.stringify(updatedEthKeys));
      localStorage.setItem('ethKey', JSON.stringify(updatedEthKeys));
    }
  }
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1>Hello {network}</h1>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full relative dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4">Import your wallet</h2>
          </div>
        </div>
      )}
    </div>
  )
}

export default Page;