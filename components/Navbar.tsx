import React from 'react'
import { Button } from './ui/button'
import { ThemeToggle } from './theme-toggle'

const Navbar = () => {
  return (
    <div className='flex justify-between items-center p-4'>
        <h1 className='text-2xl font-bold'>Logo</h1>
        <div className='flex items-center gap-4'>
            <ThemeToggle />
            <Button variant='outline'>Login</Button>
            <Button variant='outline'>Register</Button>
        </div>
    </div>
  )
}

export default Navbar