import React from 'react'
import { Button } from './ui/button'
import { ThemeToggle } from './theme-toggle'

const Navbar = () => {
  return (
    <div className='fixed top-8 left-8 right-8 border-6 border-black rounded-2xl  z-50 bg-background/50 backdrop-blur-sm dark:border-white'>
    <div className='flex justify-between items-center p-4'>
        <div className='flex items-center gap-4 pl-5'>
        <h1 className='text-2xl font-bold'>Logo</h1>
        <p className='text-sm text-muted-foreground'>Your AI-Powered Assistant</p>
        </div>
        <div className='flex items-center gap-4'>
            <ThemeToggle />
            <Button variant='outline' className='border-4 border-black dark:border-white'>Login</Button>
            <Button variant='outline' className='border-4 border-black dark:border-white'>Register</Button>
        </div>
    </div>
    </div>
  )
}

export default Navbar