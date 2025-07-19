"use client";
import React, { useState, useEffect } from 'react'
import { ThemeToggle } from './theme-toggle'
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const Navbar = () => {
  const [network, setNetwork] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNetwork = localStorage.getItem('network');
      setNetwork(storedNetwork);
    }
  }, [pathname]);

  const getNetworkConfig = (net: string) => {
    const configs = {
      sol: { name: 'Solana', symbol: 'SOL', color: 'text-purple-600 dark:text-purple-400' },
      eth: { name: 'Ethereum', symbol: 'ETH', color: 'text-blue-600 dark:text-blue-400' },
      btc: { name: 'Bitcoin', symbol: 'BTC', color: 'text-orange-600 dark:text-orange-400' }
    };
    return configs[net as keyof typeof configs] || null;
  };

  const handleNetworkChange = (newNetwork: 'sol' | 'eth' | 'btc') => {
    localStorage.setItem('network', newNetwork);
    setNetwork(newNetwork);
    if (pathname === '/coin') {
      router.refresh();
    } else {
      router.push('/coin');
    }
  };

  const currentNetworkConfig = network ? getNetworkConfig(network) : null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <div className="mx-auto max-w-7xl">
        <div className="bg-background/80 backdrop-blur-md border border-border rounded-2xl shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            {/* Logo Section */}
            <div className="flex items-center gap-6">
              <Link href="/" className="group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <span className="text-lg font-bold">N</span>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    NexVault
                  </h1>
                </div>
              </Link>

              {/* Network Indicator */}
              {currentNetworkConfig && pathname === '/coin' && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className={`text-sm font-medium ${currentNetworkConfig.color}`}>
                    {currentNetworkConfig.name}
                  </span>
                </div>
              )}
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-4">
              {/* Network Selector - Only show on home page or when no network selected */}
              {(pathname === '/' || pathname === '/import') && (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => handleNetworkChange('sol')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 group"
                  >
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span className="text-purple-600 dark:text-purple-400 font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300">
                      Solana
                    </span>
                  </button>
                  <button
                    onClick={() => handleNetworkChange('eth')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      Ethereum
                    </span>
                  </button>
                  <button
                    onClick={() => handleNetworkChange('btc')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200 group"
                  >
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-orange-600 dark:text-orange-400 font-medium group-hover:text-orange-700 dark:group-hover:text-orange-300">
                      Bitcoin
                    </span>
                  </button>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                {pathname !== '/import' && (
                  <Link href="/import">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-all duration-200">
                      <span className="text-base">📥</span>
                      <span className="hidden sm:inline font-medium">Import</span>
                    </button>
                  </Link>
                )}

                {pathname === '/coin' && (
                  <Link href="/">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-all duration-200">
                      <span className="text-base">🏠</span>
                      <span className="hidden sm:inline font-medium">Home</span>
                    </button>
                  </Link>
                )}
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar