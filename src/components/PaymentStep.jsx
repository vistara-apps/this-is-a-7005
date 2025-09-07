import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Wallet, Loader } from 'lucide-react';
import { usePaymentContext } from '../hooks/usePaymentContext';

const PaymentStep = ({ config, onBack, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('crypto');
  const { createSession } = usePaymentContext();

  const handleCryptoPayment = async () => {
    setIsProcessing(true);
    try {
      await createSession();
      // Simulate deployment delay
      setTimeout(() => {
        setIsProcessing(false);
        onPaymentSuccess();
      }, 3000);
    } catch (error) {
      console.error('Payment failed:', error);
      setIsProcessing(false);
      alert('Payment failed. Please try again.');
    }
  };

  const handleStripePayment = () => {
    setIsProcessing(true);
    // Simulate Stripe payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 2000);
  };

  if (isProcessing) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold mb-4">Processing Payment & Deployment</h2>
        <p className="text-white/80 mb-2">Please wait while we deploy your token...</p>
        <p className="text-white/60 text-sm">This usually takes 1-2 minutes</p>
        
        <div className="mt-8 space-y-2 text-left max-w-md mx-auto">
          <div className="flex items-center text-white/80">
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Processing payment...
          </div>
          <div className="flex items-center text-white/60">
            <div className="w-4 h-4 mr-2 rounded-full border-2 border-white/30"></div>
            Deploying contract to Base network...
          </div>
          <div className="flex items-center text-white/60">
            <div className="w-4 h-4 mr-2 rounded-full border-2 border-white/30"></div>
            Verifying contract on BaseScan...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-center">Complete Payment</h2>
      
      <div className="space-y-6">
        {/* Order Summary */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-white">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Token: {config.name} ({config.symbol})</span>
              <span className="text-white font-medium">$25.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/60">Supply: {Number(config.totalSupply).toLocaleString()}</span>
              <span className="text-white/60">+ Gas fees</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Payment Method</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Crypto Payment */}
            <button
              onClick={() => setPaymentMethod('crypto')}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                paymentMethod === 'crypto'
                  ? 'border-purple-400 bg-purple-400/10'
                  : 'border-white/20 bg-white/5 hover:border-white/40'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <Wallet className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-white font-medium">Crypto Payment</div>
              <div className="text-white/60 text-sm">Pay with your wallet</div>
            </button>

            {/* Credit Card Payment */}
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                paymentMethod === 'card'
                  ? 'border-purple-400 bg-purple-400/10'
                  : 'border-white/20 bg-white/5 hover:border-white/40'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <CreditCard className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-white font-medium">Credit Card</div>
              <div className="text-white/60 text-sm">Pay with Stripe</div>
            </button>
          </div>
        </div>

        {/* Payment Button */}
        <div className="space-y-4">
          {paymentMethod === 'crypto' ? (
            <button
              onClick={handleCryptoPayment}
              className="btn-primary w-full py-4 text-lg"
              disabled={isProcessing}
            >
              Pay $25 with Crypto & Deploy Token
            </button>
          ) : (
            <button
              onClick={handleStripePayment}
              className="btn-primary w-full py-4 text-lg"
              disabled={isProcessing}
            >
              Pay $25 with Card & Deploy Token
            </button>
          )}
          
          <button
            onClick={onBack}
            className="btn-secondary w-full flex items-center justify-center"
            disabled={isProcessing}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Review
          </button>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-400/30">
          <div className="flex items-start">
            <div className="text-blue-400 mr-2">🔒</div>
            <div className="text-sm text-white/80">
              <div className="font-medium mb-1">Secure Payment</div>
              <div>Your payment is processed securely. Gas fees are estimated and may vary based on network conditions.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;