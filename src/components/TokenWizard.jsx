import React, { useState } from 'react';
import TokenConfigForm from './TokenConfigForm';
import DeploymentSummary from './DeploymentSummary';
import PaymentStep from './PaymentStep';
import { CheckCircle, Circle } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Token Details', description: 'Configure your token' },
  { id: 2, title: 'Review', description: 'Review and confirm' },
  { id: 3, title: 'Payment', description: 'Complete payment' },
];

const TokenWizard = ({ onDeploymentSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [tokenConfig, setTokenConfig] = useState({
    name: '',
    symbol: '',
    totalSupply: '',
    decimals: 18,
  });

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleTokenConfigUpdate = (config) => {
    setTokenConfig(config);
  };

  const handlePaymentSuccess = () => {
    // Simulate deployment process
    const deploymentResult = {
      contractAddress: '0x742d35Cc6634C0532925a3b8D77d4B37B3C59378',
      transactionHash: '0x8f8e8d8c8b8a8988776655443322110fedcba9876543210fedcba987654321',
      tokenName: tokenConfig.name,
      tokenSymbol: tokenConfig.symbol,
      totalSupply: tokenConfig.totalSupply,
      decimals: tokenConfig.decimals,
      deploymentTimestamp: new Date().toISOString(),
      baseScanUrl: `https://basescan.org/address/0x742d35Cc6634C0532925a3b8D77d4B37B3C59378`,
    };
    
    onDeploymentSuccess(deploymentResult);
  };

  return (
    <div className="glass-card p-8 animate-slide-up">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  currentStep > step.id 
                    ? 'bg-green-500 border-green-500' 
                    : currentStep === step.id 
                    ? 'border-purple-400 bg-purple-400/20' 
                    : 'border-white/30'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <span className="text-sm font-semibold text-white">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className="text-sm font-semibold text-white">{step.title}</div>
                  <div className="text-xs text-white/60">{step.description}</div>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`hidden sm:block w-16 h-1 mx-4 rounded transition-all duration-300 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-white/20'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <TokenConfigForm 
            config={tokenConfig}
            onUpdate={handleTokenConfigUpdate}
            onNext={handleNext}
          />
        )}
        
        {currentStep === 2 && (
          <DeploymentSummary 
            config={tokenConfig}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 3 && (
          <PaymentStep 
            config={tokenConfig}
            onBack={handleBack}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default TokenWizard;