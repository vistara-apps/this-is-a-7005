import React from 'react';
import { ArrowLeft, Shield, Zap, CheckCircle } from 'lucide-react';

const DeploymentSummary = ({ config, onNext, onBack }) => {
  const estimatedGasFee = '0.0015 ETH';
  const deploymentFee = '$25.00';

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-center">Review Your Token</h2>
      
      <div className="space-y-6">
        {/* Token Details Card */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-white">Token Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-white/60">Name</div>
              <div className="text-white font-medium">{config.name}</div>
            </div>
            <div>
              <div className="text-sm text-white/60">Symbol</div>
              <div className="text-white font-medium">{config.symbol}</div>
            </div>
            <div>
              <div className="text-sm text-white/60">Total Supply</div>
              <div className="text-white font-medium">{Number(config.totalSupply).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-white/60">Decimals</div>
              <div className="text-white font-medium">{config.decimals}</div>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-400" />
            Security Features
          </h3>
          <div className="space-y-3">
            <div className="flex items-center text-white/80">
              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              OpenZeppelin audited contracts
            </div>
            <div className="flex items-center text-white/80">
              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              ERC-20 standard compliance
            </div>
            <div className="flex items-center text-white/80">
              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              Battle-tested code base
            </div>
            <div className="flex items-center text-white/80">
              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              Automatic contract verification
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-white">Cost Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Deployment Service</span>
              <span className="text-white font-medium">{deploymentFee}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Estimated Gas Fee</span>
              <span className="text-white font-medium">{estimatedGasFee}</span>
            </div>
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Total (approx.)</span>
                <span className="text-white font-bold text-lg">{deploymentFee} + Gas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deployment Process */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-400" />
            What Happens Next
          </h3>
          <div className="space-y-2 text-white/80">
            <div>1. Complete payment via your connected wallet</div>
            <div>2. Smart contract deployed to Base network</div>
            <div>3. Contract verified on BaseScan</div>
            <div>4. Receive contract address and transaction details</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={onBack}
            className="btn-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Edit
          </button>
          <button
            onClick={onNext}
            className="btn-primary flex-1"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeploymentSummary;