import React from 'react';
import { CheckCircle, ExternalLink, Copy, RefreshCw } from 'lucide-react';

const DeploymentSuccess = ({ deployment, onStartNew }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="glass-card p-8 text-center animate-fade-in">
      <div className="mb-6">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Token Deployed Successfully!</h1>
        <p className="text-white/80">
          Your {deployment.tokenName} ({deployment.tokenSymbol}) token is now live on Base network.
        </p>
      </div>

      {/* Token Details */}
      <div className="bg-white/5 rounded-lg p-6 mb-6 text-left">
        <h2 className="text-xl font-semibold text-white mb-4">Token Details</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-white/60">Token Name</div>
              <div className="text-white font-medium">{deployment.tokenName}</div>
            </div>
            <div>
              <div className="text-sm text-white/60">Symbol</div>
              <div className="text-white font-medium">{deployment.tokenSymbol}</div>
            </div>
            <div>
              <div className="text-sm text-white/60">Total Supply</div>
              <div className="text-white font-medium">{Number(deployment.totalSupply).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-white/60">Decimals</div>
              <div className="text-white font-medium">{deployment.decimals}</div>
            </div>
          </div>

          {/* Contract Address */}
          <div className="border-t border-white/20 pt-4">
            <div className="text-sm text-white/60 mb-2">Contract Address</div>
            <div className="flex items-center space-x-2 bg-white/5 rounded p-3">
              <code className="text-white font-mono text-sm flex-1">{deployment.contractAddress}</code>
              <button
                onClick={() => copyToClipboard(deployment.contractAddress)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Transaction Hash */}
          <div>
            <div className="text-sm text-white/60 mb-2">Transaction Hash</div>
            <div className="flex items-center space-x-2 bg-white/5 rounded p-3">
              <code className="text-white font-mono text-sm flex-1">{deployment.transactionHash}</code>
              <button
                onClick={() => copyToClipboard(deployment.transactionHash)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={deployment.baseScanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center justify-center flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on BaseScan
          </a>
          
          <button
            onClick={onStartNew}
            className="btn-secondary flex items-center justify-center flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Deploy Another Token
          </button>
        </div>

        {/* Next Steps */}
        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-400/30 text-left">
          <div className="text-white font-medium mb-2">🎉 What's Next?</div>
          <ul className="text-sm text-white/80 space-y-1">
            <li>• Add your token to MetaMask using the contract address</li>
            <li>• List your token on decentralized exchanges like Uniswap</li>
            <li>• Share the contract address with your community</li>
            <li>• Consider creating a website and documentation for your token</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeploymentSuccess;