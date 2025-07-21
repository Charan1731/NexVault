'use client'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const Page = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValues, setInputValues] = useState<string[]>(Array(12).fill(''));
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string>('');
    
    const handlePaste = async () => {
        try {
          const text = await navigator.clipboard.readText();
          const words = text.trim().split(/\s+/);
          
          if (words.length !== 12) {
            setError('Please paste a valid 12-word mnemonic phrase');
            return;
          }
          
          // Validate that all words are non-empty
          if (words.some(word => !word.trim())) {
            setError('Invalid mnemonic phrase format');
            return;
          }
          
          setInputValues(words);
          setError('');
          localStorage.setItem('secretKey', text.trim());
        } catch (err) {
          setError('Failed to read from clipboard');
          console.error(err);
        }
      };

    const handleInputChange = (index: number, value: string) => {
      const newValues = [...inputValues];
      newValues[index] = value.trim().toLowerCase();
      setInputValues(newValues);
      setError('');
    };

    const handleImport = (network: 'sol' | 'eth' | 'btc') => {
        setIsValidating(true);
        setError('');
        
        const mnemonicPhrase = inputValues.join(' ').trim();
        
        if (inputValues.length !== 12 || inputValues.some(word => !word.trim())) {
            setError('Please enter all 12 words of your mnemonic phrase');
            setIsValidating(false);
            return;
        }

        // Basic validation - check if words look reasonable
        if (mnemonicPhrase.length < 24) { // Very basic check
            setError('Mnemonic phrase appears to be too short');
            setIsValidating(false);
            return;
        }

        localStorage.setItem('secretKey', mnemonicPhrase);
        localStorage.setItem('network', network);
        
        setTimeout(() => {
          setIsValidating(false);
          router.push('/coin');
        }, 1000);
    };

    const getNetworkConfig = (network: 'sol' | 'eth' | 'btc') => {
      const configs = {
        sol: {
          name: 'Solana',
          icon: '⚡',
          color: 'text-purple-600 dark:text-purple-400',
          borderColor: 'border-purple-200 dark:border-purple-800',
          hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
        },
        eth: {
          name: 'Ethereum',
          icon: '💎',
          color: 'text-blue-600 dark:text-blue-400',
          borderColor: 'border-blue-200 dark:border-blue-800',
          hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
        },
        btc: {
          name: 'Bitcoin',
          icon: '₿',
          color: 'text-orange-600 dark:text-orange-400',
          borderColor: 'border-orange-200 dark:border-orange-800',
          hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-900/20'
        }
      };
      return configs[network];
    };

    const clearAll = () => {
      setInputValues(Array(12).fill(''));
      setError('');
    };

    return (
        <div className="min-h-screen pt-32 pb-16">
          <div className="container mx-auto px-4">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📥</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Import Wallet</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Enter your 12-word recovery phrase to restore your existing wallet
              </p>
            </div>

            {/* Security Notice */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-amber-600 dark:text-amber-400">🔒</span>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200">Security Notice</h4>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Your recovery phrase will be processed locally and never sent to any server.
                </p>
              </div>
            </div>

            {/* Mnemonic Input Grid */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }, (_, index) => (
                  <div key={index} className="relative">
                    <div className="relative border border-border rounded-xl bg-card p-4 hover:border-primary/30 transition-colors">
                      <div className="text-xs text-muted-foreground mb-1 font-medium">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={inputValues[index]}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none font-mono text-sm"
                        placeholder="word"
                        required
                      />
                    </div>
                    </div>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex gap-4">
                <Button 
                  onClick={handlePaste}
                  variant="outline"
                  className="flex-1 py-6 text-lg h-auto"
                >
                  <span className="mr-2">📋</span>
                  Paste
                </Button>
                <Button 
                  onClick={clearAll}
                  variant="outline"
                  className="flex-1 py-6 text-lg h-auto"
                >
                  <span className="mr-2">🗑️</span>
                  Clear
                </Button>
                <Button 
                  onClick={() => setIsOpen(true)}
                  disabled={inputValues.some(word => !word.trim()) || isValidating}
                  className="flex-1 py-6 text-lg h-auto"
                >
                  {isValidating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">📥</span>
                      Import
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* How it Works */}
            <div className="max-w-2xl mx-auto">
              <div className="p-6 border border-border rounded-xl bg-card/50">
                <h3 className="text-lg font-semibold mb-4 text-center">How to Import</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary mt-0.5">1</span>
                    <p>Enter your 12-word recovery phrase in the correct order</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary mt-0.5">2</span>
                    <p>Click &quot;Import&quot; and select your preferred blockchain network</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary mt-0.5">3</span>
                    <p>Your wallet will be restored with all associated addresses</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Selection Modal */}
            {isOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="bg-card border border-border rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-2">Select Network</h2>
                    <p className="text-muted-foreground text-sm">
                      Choose which blockchain network to import your wallet for
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {(['sol', 'eth', 'btc'] as const).map((network) => {
                      const config = getNetworkConfig(network);
                      return (
                    <button
                          key={network}
                          onClick={() => handleImport(network)}
                          disabled={isValidating}
                          className={`w-full p-4 border ${config.borderColor} rounded-lg ${config.hoverBg} transition-all duration-200 hover:shadow-md text-left disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-lg">
                              {config.icon}
                            </div>
                            <div>
                              <h3 className={`font-semibold ${config.color}`}>
                                {config.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Import for {config.name} network
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border">
                    <Button
                      onClick={() => setIsOpen(false)}
                      variant="outline"
                      className="w-full"
                      disabled={isValidating}
                    >
                      Cancel
                        </Button>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>
    )
}

export default Page