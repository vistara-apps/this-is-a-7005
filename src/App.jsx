import React, { useState } from 'react';
import Header from './components/Header';
import TokenWizard from './components/TokenWizard';
import DeploymentSuccess from './components/DeploymentSuccess';
import { useAccount } from 'wagmi';

function App() {
  const [deploymentResult, setDeploymentResult] = useState(null);
  const { isConnected } = useAccount();

  const handleDeploymentSuccess = (result) => {
    setDeploymentResult(result);
  };

  const handleStartNew = () => {
    setDeploymentResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {deploymentResult ? (
          <DeploymentSuccess 
            deployment={deploymentResult} 
            onStartNew={handleStartNew}
          />
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                BaseToken Forge
              </h1>
              <p className="text-xl text-white/80 mb-2">
                Launch your token on Base in minutes, no code required.
              </p>
              <p className="text-white/60">
                Deploy secure, audited ERC-20 tokens with just a few clicks.
              </p>
            </div>

            {/* Main Content */}
            {isConnected ? (
              <TokenWizard onDeploymentSuccess={handleDeploymentSuccess} />
            ) : (
              <div className="glass-card p-8 text-center animate-slide-up">
                <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
                <p className="text-white/80 mb-6">
                  Connect your wallet to start deploying your token on Base network.
                </p>
                <div className="text-sm text-white/60">
                  Click "Connect Wallet" in the top right corner to get started.
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;