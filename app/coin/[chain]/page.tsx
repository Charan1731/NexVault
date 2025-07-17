import { useSeedPhraseState } from '@/context/seed';
import React from 'react'

const page = () => {
  const { mnemonics, selectedChain, setMnemonics, setChain } = useSeedPhraseState();
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
        <h1>Hello</h1>
    </div>
  )
}

export default page