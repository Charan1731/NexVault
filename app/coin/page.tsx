"use client";
import { Keypair } from '@solana/web3.js';
import { mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { HDNodeWallet, Mnemonic } from 'ethers';
import React, { useEffect, useState } from 'react'
import nacl from 'tweetnacl';

const Page = () => {
  const [network, setNetwork] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [solKey, setSolKey] = useState<string | null>(null);
  const [btcKey, setBtcKey] = useState<string | null>(null);
  const [ethKey, setEthKey] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
    setTimeout(() => {
      setIsLoading(true);
    }, 300);
  }, [])

  const handleCreatePair = async () => {
    if(!secretKey) return;

    if(network === 'sol'){
      const seed = mnemonicToSeedSync(secretKey);
      const prevSolKeys = solKey ? JSON.parse(solKey) as string[] : [];
      const accountIndex = prevSolKeys.length;
      const path = `m/44'/501'/${accountIndex}'/0'`;
      const derivedSeed = derivePath(path, seed.toString("hex")).key;
      const keypair = Keypair.fromSeed(derivedSeed);
      const publicKey = keypair.publicKey.toBase58();

      const updatedSolKeys = [...prevSolKeys, publicKey];
      setSolKey(JSON.stringify(updatedSolKeys));
      localStorage.setItem('solKey', JSON.stringify(updatedSolKeys));
    }
    
    if(network === 'eth'){
      const prevEthKeys = ethKey ? JSON.parse(ethKey) as string[] : [];
      const accountIndex = prevEthKeys.length;
      const path = `m/44'/60'/0'/0/${accountIndex}`;
      const mnemonic = Mnemonic.fromPhrase(secretKey);
      const hdNode = HDNodeWallet.fromMnemonic(mnemonic, path);
      const address = hdNode.address;

      const updatedEthKeys = [...prevEthKeys, address];
      setEthKey(JSON.stringify(updatedEthKeys));
      localStorage.setItem('ethKey', JSON.stringify(updatedEthKeys));
    }
    
    if(network === 'btc'){
      // For Bitcoin, you'll need bitcoinjs-lib for proper address generation
      // This is a simplified example - you should use proper Bitcoin libraries
      const seed = mnemonicToSeedSync(secretKey);
      const prevBtcKeys = btcKey ? JSON.parse(btcKey) as string[] : [];
      const accountIndex = prevBtcKeys.length;
      const path = `m/44'/0'/${accountIndex}'/0/0`;
      
      // Note: This is NOT a proper Bitcoin address generation
      // You should use bitcoinjs-lib or similar library
      const derivedSeed = derivePath(path, seed.toString("hex")).key;
      const keypair = nacl.sign.keyPair.fromSeed(derivedSeed);
      const publicKeyHex = Buffer.from(keypair.publicKey).toString('hex');
      
      const updatedBtcKeys = [...prevBtcKeys, publicKeyHex];
      setBtcKey(JSON.stringify(updatedBtcKeys));
      localStorage.setItem('btcKey', JSON.stringify(updatedBtcKeys));
    }
  }

  const renderKeys = () => {
    if(!network) return null;

    let keys: string[] = [];
    if(network === 'sol' && solKey) {
      keys = JSON.parse(solKey);
    } else if(network === 'eth' && ethKey) {
      keys = JSON.parse(ethKey);
    } else if(network === 'btc' && btcKey) {
      keys = JSON.parse(btcKey);
    }

    return (
      <div className="mt-4 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Generated {network.toUpperCase()} Wallets:</h2>
        {keys.length === 0 ? (
          <p className="text-gray-500">No wallets generated yet</p>
        ) : (
          <div className="space-y-2">
            {keys.map((key, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm font-medium">Wallet {index + 1}:</p>
                <p className="text-xs font-mono break-all">{key}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4'>
      <h1 className="text-3xl font-bold mb-4">Hello {network?.toUpperCase()}</h1>
      
      {secretKey && (
        <button 
          onClick={handleCreatePair}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg mb-4"
        >
          Generate New {network?.toUpperCase()} Wallet
        </button>
      )}

      {renderKeys()}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full relative dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4">Import your wallet</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please import your mnemonic phrase to continue
            </p>
            <button 
              onClick={() => setIsOpen(false)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Page;