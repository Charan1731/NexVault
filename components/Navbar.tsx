"use client";
import React from 'react'
import { Button } from './ui/button'
import { ThemeToggle } from './theme-toggle'
import Link from 'next/link';

const Navbar = () => {
  return (
    <div className='fixed top-8 left-8 right-8 border-6 border-black rounded-2xl  z-50 bg-background/50 backdrop-blur-sm dark:border-white'>
    <div className='flex justify-between items-center p-4'>
        <div className='flex items-center gap-4 pl-5'>
        <Link href="/">
        <h1 className='text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'>NexVault</h1>
        </Link>
        </div>
        <div className='flex items-center gap-4'>
            <ThemeToggle />
        </div>
    </div>
    </div>
  )
}

export default Navbar