import { useSeedPhraseState } from "@/context/seed";
import * as bip39 from 'bip39';

const generateMnemonics = () => {
    const mnemonics = bip39.generateMnemonic();
    return mnemonics;
}

const generateSeed = (mnemonics: string) => {
    const seed = bip39.mnemonicToSeedSync(mnemonics);
    return seed;
}

