"use client";
import axios from 'axios';
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
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [expandedWallets, setExpandedWallets] = useState<{ [key: number]: boolean }>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ [key: number]: boolean }>({});
  const [walletBalances, setWalletBalances] = useState<{ [key: string]: number | null }>({});

  const toggleWalletExpansion = (walletIndex: number) => {
    setExpandedWallets(prev => ({
      ...prev,
      [walletIndex]: !prev[walletIndex]
    }));
  };

  const togglePrivateKeyVisibility = (walletIndex: number) => {
    setVisiblePrivateKeys(prev => ({
      ...prev,
      [walletIndex]: !prev[walletIndex]
    }));
  };

  const toggleDeleteConfirmation = (walletIndex: number) => {
    setDeleteConfirmation(prev => ({
      ...prev,
      [walletIndex]: !prev[walletIndex]
    }));
  };

  const deleteWallet = (walletIndex: number) => {
    if (!network) return;

    if (network === 'sol' && solKey) {
      const keys = JSON.parse(solKey);
      const updatedKeys = keys.filter((_: {publicKey: string, privateKey: string, index: number}, index: number) => index !== walletIndex);
      setSolKey(updatedKeys.length > 0 ? JSON.stringify(updatedKeys) : null);
      localStorage.setItem('solKey', updatedKeys.length > 0 ? JSON.stringify(updatedKeys) : '');
    }

    if (network === 'eth' && ethKey) {
      const keys = JSON.parse(ethKey);
      const updatedKeys = keys.filter((_: {publicKey: string, privateKey: string, index: number}, index: number) => index !== walletIndex);
      setEthKey(updatedKeys.length > 0 ? JSON.stringify(updatedKeys) : null);
      localStorage.setItem('ethKey', updatedKeys.length > 0 ? JSON.stringify(updatedKeys) : '');
    }

    if (network === 'btc' && btcKey) {
      const keys = JSON.parse(btcKey);
      const updatedKeys = keys.filter((_: {publicKey: string, privateKey: string, index: number}, index: number) => index !== walletIndex);
      setBtcKey(updatedKeys.length > 0 ? JSON.stringify(updatedKeys) : null);
      localStorage.setItem('btcKey', updatedKeys.length > 0 ? JSON.stringify(updatedKeys) : '');
    }

    // Close confirmation dialog
    setDeleteConfirmation(prev => ({
      ...prev,
      [walletIndex]: false
    }));

    // Close expanded wallet if it was open
    setExpandedWallets(prev => ({
      ...prev,
      [walletIndex]: false
    }));

    // Hide private key if it was visible
    setVisiblePrivateKeys(prev => ({
      ...prev,
      [walletIndex]: false
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

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItem(type);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const getNetworkConfig = (net: string) => {
    const configs = {
      sol: { name: 'Solana', symbol: 'SOL' },
      eth: { name: 'Ethereum', symbol: 'ETH' },
      btc: { name: 'Bitcoin', symbol: 'BTC' }
    };
    return configs[net as keyof typeof configs] || configs.sol;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNetwork = localStorage.getItem('network') || 'sol';
      const storedSolKey = localStorage.getItem('solKey');
      const storedBtcKey = localStorage.getItem('btcKey');
      const storedEthKey = localStorage.getItem('ethKey');
      let storedSecretKey = localStorage.getItem('secretKey');

      if (!storedSecretKey) {
        storedSecretKey = generateMnemonic();
        localStorage.setItem('secretKey', storedSecretKey);
      }

      setNetwork(storedNetwork);
      setSolKey(storedSolKey);
      setBtcKey(storedBtcKey);
      setEthKey(storedEthKey);
      setSecretKey(storedSecretKey);
    }
    setTimeout(() => {
      setIsLoading(true);
    }, 300);
  }, []);

  const fetchBalance = async (publicKey: string) => {
    try {
      if (network === 'sol') {
        const response = await axios.post("https://solana-mainnet.g.alchemy.com/v2/PuUVsZ8f1YrRGtbp295ycUcpSl8N6w58", {
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [publicKey]
        });
        const balance = response.data.result.value / 10 ** 9; // Convert lamports to SOL
        setWalletBalances(prev => ({ ...prev, [publicKey]: balance }));
      } else if (network === 'eth') {
        const response = await axios.post("https://eth-sepolia.g.alchemy.com/v2/PuUVsZ8f1YrRGtbp295ycUcpSl8N6w58", {
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [publicKey, "latest"]
        });
        // Convert wei to ETH (1 ETH = 10^18 wei)
        const balanceInWei = parseInt(response.data.result, 16);
        const balance = balanceInWei / 10 ** 18;
        setWalletBalances(prev => ({ ...prev, [publicKey]: balance }));
      }
    } catch (error) {
      console.error(`Error fetching ${network?.toUpperCase()} balance:`, error);
      setWalletBalances(prev => ({ ...prev, [publicKey]: 0 }));
    }
  };

  // Fetch balances for all wallets when they change
  useEffect(() => {
    const getCurrentKeys = () => {
      if (network === 'sol' && solKey) return JSON.parse(solKey);
      if (network === 'eth' && ethKey) return JSON.parse(ethKey);
      if (network === 'btc' && btcKey) return JSON.parse(btcKey);
      return [];
    };

    const keys = getCurrentKeys();
    if (keys.length > 0) {
      keys.forEach((wallet: {publicKey: string, privateKey: string, index: number}) => {
        fetchBalance(wallet.publicKey);
      });
    }
  }, [network, solKey, ethKey, btcKey]);

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
      <div className="w-full max-w-5xl mb-8">
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          {/* Accordion Header */}
          <div 
            className="p-6 cursor-pointer hover:bg-accent/50 transition-all duration-300 border-b border-border/50"
            onClick={() => setShowMnemonic(!showMnemonic)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 text-white rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-lg">🔑</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Secret Recovery Phrase</h3>
                  <p className="text-sm text-muted-foreground">Your master seed for wallet generation</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Master Key</span>
                </div>
                <div className={`w-5 h-5 transition-transform duration-300 ${showMnemonic ? 'rotate-180' : ''}`}>
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Accordion Content */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
            showMnemonic ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="p-6 space-y-4">
              <div className="bg-muted/50 border border-border/50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-2">
                  {secretKey.split(' ').map((word, index) => (
                    <div key={index} className="bg-background border border-border/30 rounded p-2 hover:border-primary/30 transition-colors">
                      <span className="text-xs text-muted-foreground block">{index + 1}</span>
                      <span className="text-sm font-mono">{word}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 items-center justify-between pt-2">
                <button
                  onClick={() => copyToClipboard(secretKey, 'mnemonic')}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent hover:border-primary/30 transition-all duration-200 group"
                >
                  <span className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors">
                    {copiedItem === 'mnemonic' ? '✓' : '📋'}
                  </span>
                  <span className="font-medium">
                    {copiedItem === 'mnemonic' ? 'Copied!' : 'Copy All'}
                  </span>
                </button>
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
                  <span>⚠️</span>
                  <span>Keep this phrase secure and private</span>
                </div>
              </div>
            </div>
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

    const config = getNetworkConfig(network);



    return (
      <div className="w-full max-w-5xl">
        {renderMnemonicSection()}
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">{config.name} Wallets</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {keys.length} wallet{keys.length !== 1 ? 's' : ''} generated
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-muted-foreground">Active</span>
          </div>
        </div>

        {keys.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-2xl flex items-center justify-center border-2 border-dashed border-border">
              <span className="text-3xl">💼</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No wallets generated yet</h3>
            <p className="text-muted-foreground">Click the button above to create your first {config.name} wallet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {keys.map((wallet, index) => (
              <div key={index} className="border border-border rounded-xl bg-card overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:border-primary/20">
                {/* Accordion Header */}
                <div className="p-6 border-b border-border/50">
                  <div className="flex justify-between items-center">
                    <div 
                      className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity flex-1"
                      onClick={() => toggleWalletExpansion(index)}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center text-lg font-bold shadow-sm">
                          {index + 1}
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Wallet {index + 1}</h3>
                        <p className="text-sm text-muted-foreground">{config.name} • Account {wallet.index}</p>
                        <p className="text-sm text-muted-foreground">
                          {config.name} • Balance: {
                            walletBalances[wallet.publicKey] !== undefined 
                              ? `${walletBalances[wallet.publicKey]?.toFixed(4) || '0'} ${config.symbol}` 
                              : 'Loading...'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        #{wallet.index}
                      </span>
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDeleteConfirmation(index);
                        }}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200 group"
                      >
                        <span className="w-3.5 h-3.5 group-hover:scale-110 transition-transform">
                          🗑️
                        </span>
                        <span className="font-medium">Delete</span>
                      </button>

                      <div 
                        className={`w-5 h-5 transition-transform duration-300 cursor-pointer hover:opacity-80 ${expandedWallets[index] ? 'rotate-180' : ''}`}
                        onClick={() => toggleWalletExpansion(index)}
                      >
                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accordion Content */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedWallets[index] ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="p-6 space-y-6">
                    {/* Public Key Section */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <label className="text-sm font-semibold text-foreground">
                            {network === 'eth' ? 'Address' : 'Public Key'}
                          </label>
                        </div>
                        <button
                          onClick={() => copyToClipboard(wallet.publicKey, `public-${index}`)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-accent hover:border-primary/30 transition-all duration-200 group"
                        >
                          <span className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors">
                            {copiedItem === `public-${index}` ? '✓' : '📋'}
                          </span>
                          <span className="font-medium">
                            {copiedItem === `public-${index}` ? 'Copied!' : 'Copy'}
                          </span>
                        </button>
                      </div>
                      <div className="relative group">
                        <div className="bg-muted/50 border border-border/50 p-4 rounded-lg font-mono text-xs leading-relaxed break-all hover:bg-muted/70 transition-colors cursor-pointer"
                             onClick={() => copyToClipboard(wallet.publicKey, `public-${index}`)}>
                          {wallet.publicKey}
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Private Key Section */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <label className="text-sm font-semibold text-foreground">Private Key</label>
                          <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                            <span className="text-xs">⚠️</span>
                            <span className="font-medium">Sensitive</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => togglePrivateKeyVisibility(index)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-accent hover:border-primary/30 transition-all duration-200 group"
                          >
                            <span className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors">
                              {visiblePrivateKeys[index] ? '🙈' : '👁️'}
                            </span>
                            <span className="font-medium">
                              {visiblePrivateKeys[index] ? 'Hide' : 'Show'}
                            </span>
                          </button>
                          {visiblePrivateKeys[index] && (
                            <button
                              onClick={() => copyToClipboard(wallet.privateKey, `private-${index}`)}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200 group"
                            >
                              <span className="w-3.5 h-3.5 group-hover:scale-110 transition-transform">
                                {copiedItem === `private-${index}` ? '✓' : '📋'}
                              </span>
                              <span className="font-medium">
                                {copiedItem === `private-${index}` ? 'Copied!' : 'Copy'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="relative group">
                        <div className={`bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/50 p-4 rounded-lg font-mono text-xs leading-relaxed break-all transition-all duration-200 ${
                          visiblePrivateKeys[index] 
                            ? 'hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer' 
                            : 'hover:bg-red-50/70 dark:hover:bg-red-900/15'
                        }`}
                             onClick={visiblePrivateKeys[index] ? () => copyToClipboard(wallet.privateKey, `private-${index}`) : undefined}>
                          <span className="text-red-600 dark:text-red-400">
                            {visiblePrivateKeys[index] ? wallet.privateKey : maskPrivateKey(wallet.privateKey)}
                          </span>
                        </div>
                        {visiblePrivateKeys[index] && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Information */}
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Generated from seed phrase</span>
                        <div className="flex items-center gap-1">
                          <span>Derivation path:</span>
                          <code className="text-xs bg-background px-1.5 py-0.5 rounded font-mono">
                            m/44&apos;/{network === 'sol' ? '501' : network === 'eth' ? '60' : '0'}&apos;/{wallet.index}&apos;/0{network === 'btc' ? '/0' : network === 'eth' ? `/${wallet.index}` : ''}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirmation[index] && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                          <span className="text-3xl">⚠️</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Delete Wallet {index + 1}?</h3>
                        <p className="text-muted-foreground mb-6">
                          This action cannot be undone. The wallet will be permanently removed from this device.
                          <br />
                          <span className="text-amber-600 dark:text-amber-400 text-sm mt-2 block">
                            You can recover it using your seed phrase if needed.
                          </span>
                        </p>
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => toggleDeleteConfirmation(index)}
                            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => deleteWallet(index)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                          >
                            <span>🗑️</span>
                            Delete Wallet
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading wallet...</p>
        </div>
      </div>
    );
  }

  const config = getNetworkConfig(network || 'sol');

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {config.name} Wallet
          </h1>
          <p className="text-muted-foreground">Manage your {config.name} addresses and keys securely</p>
        </div>

        {/* Generate Wallet Button */}
        <div className="flex justify-center mb-8">
          {secretKey && (
            <button
              onClick={handleCreatePair}
              disabled={isGeneratingNew}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGeneratingNew ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <span>+</span>
                  Generate New Wallet
                </>
              )}
            </button>
          )}
        </div>

        {/* Wallets Display */}
        <div className="flex justify-center">
          {renderKeys()}
        </div>

        {/* Import Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">Import Wallet</h2>
              <p className="text-muted-foreground mb-6">
                Please import your mnemonic phrase to continue accessing your wallets
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
