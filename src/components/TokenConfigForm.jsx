import React, { useState } from 'react';
import { Info, AlertCircle } from 'lucide-react';

const TokenConfigForm = ({ config, onUpdate, onNext }) => {
  const [formData, setFormData] = useState(config);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Token name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Token name must be at least 2 characters';
    }
    
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Token symbol is required';
    } else if (formData.symbol.length < 2 || formData.symbol.length > 10) {
      newErrors.symbol = 'Token symbol must be 2-10 characters';
    }
    
    if (!formData.totalSupply || formData.totalSupply <= 0) {
      newErrors.totalSupply = 'Total supply must be greater than 0';
    }
    
    if (formData.decimals < 0 || formData.decimals > 18) {
      newErrors.decimals = 'Decimals must be between 0 and 18';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onUpdate(formData);
      onNext();
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-center">Configure Your Token</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Token Name */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Token Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., My Awesome Token"
            className={`input-field ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.name && (
            <div className="flex items-center mt-1 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.name}
            </div>
          )}
          <div className="flex items-center mt-1 text-white/60 text-sm">
            <Info className="w-4 h-4 mr-1" />
            The full name of your token (e.g., "Ethereum")
          </div>
        </div>

        {/* Token Symbol */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Token Symbol *
          </label>
          <input
            type="text"
            value={formData.symbol}
            onChange={(e) => handleChange('symbol', e.target.value.toUpperCase())}
            placeholder="e.g., MAT"
            className={`input-field ${errors.symbol ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            maxLength={10}
          />
          {errors.symbol && (
            <div className="flex items-center mt-1 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.symbol}
            </div>
          )}
          <div className="flex items-center mt-1 text-white/60 text-sm">
            <Info className="w-4 h-4 mr-1" />
            A short identifier for your token (e.g., "ETH")
          </div>
        </div>

        {/* Total Supply */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Total Supply *
          </label>
          <input
            type="number"
            value={formData.totalSupply}
            onChange={(e) => handleChange('totalSupply', e.target.value)}
            placeholder="e.g., 1000000"
            className={`input-field ${errors.totalSupply ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            min="1"
          />
          {errors.totalSupply && (
            <div className="flex items-center mt-1 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.totalSupply}
            </div>
          )}
          <div className="flex items-center mt-1 text-white/60 text-sm">
            <Info className="w-4 h-4 mr-1" />
            The total number of tokens that will exist
          </div>
        </div>

        {/* Decimals */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Decimals
          </label>
          <select
            value={formData.decimals}
            onChange={(e) => handleChange('decimals', parseInt(e.target.value))}
            className="input-field"
          >
            {[...Array(19)].map((_, i) => (
              <option key={i} value={i} className="bg-purple-900 text-white">
                {i} {i === 18 ? '(Standard)' : ''}
              </option>
            ))}
          </select>
          <div className="flex items-center mt-1 text-white/60 text-sm">
            <Info className="w-4 h-4 mr-1" />
            Number of decimal places (18 is standard for most tokens)
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className="btn-primary px-8 py-3 text-lg"
          >
            Continue to Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default TokenConfigForm;