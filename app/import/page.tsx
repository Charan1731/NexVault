'use client'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mnemonic, HDNodeWallet } from 'ethers'

const Page = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    
    const handlePaste = async () => {
        try {
          const text = await navigator.clipboard.readText();
          const words = text.split(' ');
          if (words.length !== 12) {
            return;
          }
          const inputs = document.querySelectorAll('input[type="text"]');
          if (inputs.length !== 12) {
            return;
          }
          inputs.forEach((input, index) => {
            if (input instanceof HTMLInputElement) {
              input.value = words[index];
            }
          });
          localStorage.setItem('secretKey', text);
        } catch (err) {
          console.error(err);
        }
      };

    const generateWalletFromMnemonic = (mnemonic: string, network: 'sol' | 'eth' | 'btc') => {
        try {
            const mnemonicObj = Mnemonic.fromPhrase(mnemonic);
            let walletData = {};

            switch (network) {
                case 'eth':
                    // Ethereum derivation path: m/44'/60'/0'/0/0
                    const ethHdNode = HDNodeWallet.fromMnemonic(mnemonicObj, "m/44'/60'/0'/0/0");
                    walletData = {
                        network: 'eth',
                        address: ethHdNode.address,
                        privateKey: ethHdNode.privateKey,
                        publicKey: ethHdNode.publicKey,
                        derivationPath: "m/44'/60'/0'/0/0"
                    };
                    break;

                case 'sol':
                    // Solana derivation path: m/44'/501'/0'/0'
                    // Note: For Solana, you'll need additional libraries like @solana/web3.js
                    // This is a simplified example using ethers for demonstration
                    const solHdNode = HDNodeWallet.fromMnemonic(mnemonicObj, "m/44'/501'/0'/0'");
                    walletData = {
                        network: 'sol',
                        address: solHdNode.address, // This won't be a valid Solana address
                        privateKey: solHdNode.privateKey,
                        publicKey: solHdNode.publicKey,
                        derivationPath: "m/44'/501'/0'/0'",
                        note: "Use @solana/web3.js for proper Solana wallet generation"
                    };
                    break;

                case 'btc':
                    // Bitcoin derivation path: m/44'/0'/0'/0/0
                    const btcHdNode = HDNodeWallet.fromMnemonic(mnemonicObj, "m/44'/0'/0'/0/0");
                    walletData = {
                        network: 'btc',
                        address: btcHdNode.address, // This won't be a valid Bitcoin address
                        privateKey: btcHdNode.privateKey,
                        publicKey: btcHdNode.publicKey,
                        derivationPath: "m/44'/0'/0'/0/0",
                        note: "Use bitcoinjs-lib for proper Bitcoin wallet generation"
                    };
                    break;

                default:
                    throw new Error('Unsupported network');
            }

            return walletData;
        } catch (error) {
            console.error('Error generating wallet:', error);
            return null;
        }
    };

    const handleImport = (network: 'sol' | 'eth' | 'btc') => {
        const inputs = document.querySelectorAll('input[type="text"]');
        const mnemonic = Array.from(inputs).map(input => {
          if (input instanceof HTMLInputElement) {
            return input.value;
          }
          return '';
        });
        
        const mnemonicPhrase = mnemonic.join(' ');
        
        if (mnemonic.length !== 12 || mnemonic.some(word => word.trim() === '')) {
            alert('Please enter a valid 12-word mnemonic phrase');
            return;
        }

        const walletData = generateWalletFromMnemonic(mnemonicPhrase, network);
        
        if (!walletData) {
            alert('Failed to generate wallet. Please check your mnemonic phrase.');
            return;
        }

        localStorage.setItem('secretKey', mnemonicPhrase);
        localStorage.setItem('network', network);
        localStorage.setItem('walletData', JSON.stringify(walletData));
        
        router.push(`/coin`);
    };

    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <div>
                <h1 className='text-[60px] font-bold text-center font-sans'>Import Wallet</h1>
                <p className='text-center text-gray-500'>Enter your 12-word mnemonic to import your wallet</p>
            </div>
            <div className='grid grid-cols-3 grid-rows-4 gap-4 mt-10'>
                {Array.from({ length: 12 }, (_, index) => (
                    <div 
                      key={index} 
                      className="flex flex-row items-center border w-[170px] bg-gray-200 dark:bg-gray-800 border-black p-2 rounded-xl transform transition-all duration-500 hover:scale-105"
                    >
                      <div className="text-sm text-gray-500">{index + 1}</div>
                      <input
                        type="text"
                        className="pl-2 focus:outline-none bg-transparent text-black dark:text-white w-full"
                        required
                      />
                    </div>
                ))}
            </div>
            <div className='flex flex-wrap gap-4 items-center justify-center mt-10'>
                <Button className='bg-black w-[170px] text-white hover:cursor-pointer dark:bg-white dark:text-black p-6' onClick={() => setIsOpen(true)}>
                    Import
                </Button>
                <Button className='bg-black w-[170px] text-white hover:cursor-pointer dark:bg-white dark:text-black p-6' onClick={() => handlePaste()}>
                    Paste
                </Button>
            </div>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full relative dark:bg-gray-800">
                    <h2 className="text-xl font-semibold mb-4">Import your wallet</h2>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
                    >
                      ×
                    </button>
                    <div className='flex flex-wrap justify-center gap-4 mt-10'>
                        <Button className='bg-black w-[170px] text-white hover:cursor-pointer dark:bg-white dark:text-black p-6' onClick={() => handleImport('sol')}>
                            Solana
                        </Button>
                        <Button className='bg-black w-[170px] text-white hover:cursor-pointer dark:bg-white dark:text-black p-6' onClick={() => handleImport('eth')}>
                            Ethereum
                        </Button>
                        <Button className='bg-black w-[170px] text-white hover:cursor-pointer dark:bg-white dark:text-black p-6' onClick={() => handleImport('btc')}>
                            Bitcoin
                        </Button>
                    </div>
                  </div>
                </div>
            )}
        </div>
    )
}

export default Page