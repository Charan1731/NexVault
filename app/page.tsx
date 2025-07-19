"use client";
import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation';

const Home = () => {
  const router = useRouter();
  
  const handleClick = async (chain: 'sol' | 'btc' | 'eth') => {
    localStorage.setItem('network', chain);
    router.push('/coin')
  }

  const handleImport = () => {
    const secretKey = localStorage.getItem('secretKey');
    if (!secretKey) {
      router.push('/import');
    } else {
      router.push('/coin');
    }
  }

  const getNetworkConfig = (network: 'sol' | 'eth' | 'btc') => {
    const configs = {
      sol: {
        name: 'Solana',
        icon: '⚡',
        description: 'Fast, secure blockchain for decentralized apps',
        color: 'text-purple-600 dark:text-purple-400',
        borderColor: 'border-purple-200 dark:border-purple-800',
        hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
      },
      eth: {
        name: 'Ethereum',
        icon: '💎',
        description: 'World computer for smart contracts',
        color: 'text-blue-600 dark:text-blue-400',
        borderColor: 'border-blue-200 dark:border-blue-800',
        hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
      },
      btc: {
        name: 'Bitcoin',
        icon: '₿',
        description: 'Digital gold and store of value',
        color: 'text-orange-600 dark:text-orange-400',
        borderColor: 'border-orange-200 dark:border-orange-800',
        hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-900/20'
      }
    };
    return configs[network];
  };

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Create your own{' '}
              <span className="text-primary">Web3</span>
              <br />
              Hierarchical Deterministic Wallets
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Secure and scalable wallets supporting multiple blockchains.
              Generate unlimited addresses from a single seed phrase.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
            <div className="p-6 border border-border rounded-xl bg-card">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold mb-2">Secure</h3>
              <p className="text-sm text-muted-foreground">
                Your keys, your crypto. Private keys never leave your device.
              </p>
            </div>
            
            <div className="p-6 border border-border rounded-xl bg-card">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="font-semibold mb-2">Multi-Chain</h3>
              <p className="text-sm text-muted-foreground">
                Support for Solana, Ethereum, and Bitcoin networks.
              </p>
            </div>
            
            <div className="p-6 border border-border rounded-xl bg-card">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">HD Wallets</h3>
              <p className="text-sm text-muted-foreground">
                Generate unlimited addresses from one recovery phrase.
              </p>
            </div>
          </div>
        </div>

        {/* Network Selection */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Choose Your Blockchain</h2>
            <p className="text-muted-foreground">Select a network to create your first wallet</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {(['sol', 'eth', 'btc'] as const).map((network) => {
              const config = getNetworkConfig(network);
              return (
                <button
                  key={network}
                  onClick={() => handleClick(network)}
                  className={`group p-6 border ${config.borderColor} rounded-xl bg-card ${config.hoverBg} transition-all duration-200 hover:shadow-lg hover:scale-[1.02] text-left`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center text-2xl">
                      {config.icon}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${config.color}`}>
                        {config.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Create wallet →
                    </span>
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <span className="text-primary">+</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Import Section */}
          <div className="text-center">
            <div className="p-8 border border-border rounded-xl bg-card/50">
              <div className="mb-4">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📥</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Already have a wallet?</h3>
                <p className="text-muted-foreground mb-6">
                  Import your existing wallet using your 12-word recovery phrase
                </p>
              </div>
              
              <Button 
                onClick={handleImport}
                variant="outline"
                className="px-8 py-6 text-lg h-auto"
              >
                <span className="mr-2">📥</span>
                Import Existing Wallet
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="max-w-2xl mx-auto text-center mt-16">
          <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-amber-600 dark:text-amber-400">⚠️</span>
              <h4 className="font-semibold text-amber-800 dark:text-amber-200">Important Security Notice</h4>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Never share your recovery phrase with anyone. NexVault cannot recover lost phrases. 
              Write it down and store it safely offline.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home