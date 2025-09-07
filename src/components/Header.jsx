import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Coins } from 'lucide-react';

const Header = () => {
  return (
    <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
        <div className="flex items-center space-x-2">
          <Coins className="w-8 h-8 text-purple-400" />
          <span className="text-xl font-bold text-white">BaseToken Forge</span>
        </div>
        
        <ConnectButton />
      </div>
    </header>
  );
};

export default Header;