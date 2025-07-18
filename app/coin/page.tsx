"use client";

import { Keypair } from '@solana/web3.js';
import { mnemonicToSeedSync, generateMnemonic } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { HDNodeWallet, Mnemonic } from 'ethers';
import React, { useEffect, useState } from 'react';
import nacl from 'tweetnacl';

const Page: React.FC = () => {
  const [network, setNetwork] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [solKey, setSolKey] = useState<string | null>(null);
  const [btcKey, setBtcKey] = useState<string | null>(null);
  const [ethKey, setEthKey] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [visiblePrivateKeys, setVisiblePrivateKeys] = useState<{ [key: number]: boolean }>({});
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showMnemonic, setShowMnemonic] = useState<boolean>(false);
  const [isGeneratingNew, setIsGeneratingNew] = useState<boolean>(false);

  const togglePrivateKeyVisibility = (walletIndex: number) => {
    setVisiblePrivateKeys(prev => ({
      ...prev,
      [walletIndex]: !prev[walletIndex]
    }));
  };

  const maskPrivateKey = (privateKey: string) => {
    return privateKey.slice(0, 6) + '•'.repeat(privateKey.length - 12) + privateKey.slice(-6);
  };

  const maskMnemonic = (mnemonic: string) => {
    const words = mnemonic.split(' ');
    return words.map((word, index) =>
      index < 2 || index > words.length - 3 ? word : '•'.repeat(word.length)
    ).join(' ');
  };

  const generateNewWallet = () => {
    setIsGeneratingNew(true);
    const newMnemonic = generateMnemonic();
    setSecretKey(newMnemonic);
    localStorage.setItem('secretKey', newMnemonic);

    if (!network) {
      setNetwork('sol');
      localStorage.setItem('network', 'sol');
    }

    setIsOpen(false);
    setIsGeneratingNew(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const network = localStorage.getItem('network') || 'sol';
      const solKey = localStorage.getItem('solKey');
      const btcKey = localStorage.getItem('btcKey');
      const ethKey = localStorage.getItem('ethKey');
      const secretKey = localStorage.getItem('secretKey');

      if (!secretKey) {
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
  }, []);

  const handleCreatePair = async () => {
    if (!secretKey) return;

    if (network === 'sol') {
      const seed = mnemonicToSeedSync(secretKey);
      const prevSolKeys = solKey ? JSON.parse(solKey) : [];
      const accountIndex = prevSolKeys.length;
      const path = `m/44'/501'/${accountIndex}'/0'`;
      const derivedSeed = derivePath(path, seed.toString("hex")).key;
      const keypair = Keypair.fromSeed(derivedSeed);
      const publicKey = keypair.publicKey.toBase58();
      const privateKey = Buffer.from(keypair.secretKey).toString('hex');

      const walletData = { publicKey, privateKey, index: accountIndex };
      const updatedSolKeys = [...prevSolKeys, walletData];
      setSolKey(JSON.stringify(updatedSolKeys));
      localStorage.setItem('solKey', JSON.stringify(updatedSolKeys));
    }

    if (network === 'eth') {
      const prevEthKeys = ethKey ? JSON.parse(ethKey) : [];
      const accountIndex = prevEthKeys.length;
      const path = `m/44'/60'/0'/0/${accountIndex}`;
      const mnemonic = Mnemonic.fromPhrase(secretKey);
      const hdNode = HDNodeWallet.fromMnemonic(mnemonic, path);
      const address = hdNode.address;
      const privateKey = hdNode.privateKey;

      const walletData = { publicKey: address, privateKey, index: accountIndex };
      const updatedEthKeys = [...prevEthKeys, walletData];
      setEthKey(JSON.stringify(updatedEthKeys));
      localStorage.setItem('ethKey', JSON.stringify(updatedEthKeys));
    }

    if (network === 'btc') {
      const seed = mnemonicToSeedSync(secretKey);
      const prevBtcKeys = btcKey ? JSON.parse(btcKey) : [];
      const accountIndex = prevBtcKeys.length;
      const path = `m/44'/0'/${accountIndex}'/0/0`;
      const derivedSeed = derivePath(path, seed.toString("hex")).key;
      const keypair = nacl.sign.keyPair.fromSeed(derivedSeed);
      const publicKeyHex = Buffer.from(keypair.publicKey).toString('hex');
      const privateKeyHex = Buffer.from(keypair.secretKey).toString('hex');

      const walletData = { publicKey: publicKeyHex, privateKey: privateKeyHex, index: accountIndex };
      const updatedBtcKeys = [...prevBtcKeys, walletData];
      setBtcKey(JSON.stringify(updatedBtcKeys));
      localStorage.setItem('btcKey', JSON.stringify(updatedBtcKeys));
    }
  };

  const renderMnemonicSection = () => {
    if (!secretKey) return null;

    return (
      <div className="w-full max-w-4xl mb-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              🔑 Your Secret Recovery Phrase
            </h3>
            <button
              onClick={() => setShowMnemonic(!showMnemonic)}
              className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition-colors"
            >
              {showMnemonic ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded border mb-3">
            <p className="text-sm font-mono break-all text-yellow-700 dark:text-yellow-300">
              {showMnemonic ? secretKey : maskMnemonic(secretKey)}
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => copyToClipboard(secretKey)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
            >
              Copy
            </button>
            <p className="text-yellow-700 dark:text-yellow-300 italic">
              ⚠️ Keep this phrase secure! Anyone with this phrase can access your wallets.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderKeys = () => {
    if (!network) return null;

    let keys: {publicKey: string, privateKey: string, index: number}[] = [];
    if (network === 'sol' && solKey) keys = JSON.parse(solKey);
    else if (network === 'eth' && ethKey) keys = JSON.parse(ethKey);
    else if (network === 'btc' && btcKey) keys = JSON.parse(btcKey);

    return (
      <div className="w-full max-w-4xl">
        {renderMnemonicSection()}
        <h2 className="text-xl font-semibold mb-4">Generated {network.toUpperCase()} Wallets:</h2>
        {keys.length === 0 ? (
          <p className="text-gray-500">No wallets generated yet</p>
        ) : (
          <div className="space-y-4">
            {keys.map((wallet, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-lg font-medium">Wallet {index + 1}</p>
                  <span className="text-sm text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                    Index: {wallet.index}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Public Key / Address:
                    </p>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                      <p className="text-xs font-mono break-all">{wallet.publicKey}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Private Key:
                      </p>
                      <button
                        onClick={() => togglePrivateKeyVisibility(index)}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                      >
                        {visiblePrivateKeys[index] ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                      <p className="text-xs font-mono break-all text-red-600 dark:text-red-400">
                        {visiblePrivateKeys[index]
                          ? wallet.privateKey
                          : maskPrivateKey(wallet.privateKey)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4 mt-30'>
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
  );
};

export default Page;
