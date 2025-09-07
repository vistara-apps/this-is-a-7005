import Joi from 'joi';

// Token configuration validation schema
const tokenConfigSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(50)
    .pattern(/^[a-zA-Z0-9\s\-_]+$/)
    .required()
    .messages({
      'string.empty': 'Token name is required',
      'string.min': 'Token name must be at least 1 character',
      'string.max': 'Token name must not exceed 50 characters',
      'string.pattern.base': 'Token name can only contain letters, numbers, spaces, hyphens, and underscores'
    }),
  
  symbol: Joi.string()
    .min(1)
    .max(10)
    .pattern(/^[A-Z0-9]+$/)
    .required()
    .messages({
      'string.empty': 'Token symbol is required',
      'string.min': 'Token symbol must be at least 1 character',
      'string.max': 'Token symbol must not exceed 10 characters',
      'string.pattern.base': 'Token symbol can only contain uppercase letters and numbers'
    }),
  
  totalSupply: Joi.string()
    .pattern(/^\d+(\.\d+)?$/)
    .custom((value, helpers) => {
      const num = parseFloat(value);
      if (num <= 0) {
        return helpers.error('number.positive');
      }
      if (num > 1e15) { // 1 quadrillion max
        return helpers.error('number.max');
      }
      return value;
    })
    .required()
    .messages({
      'string.empty': 'Total supply is required',
      'string.pattern.base': 'Total supply must be a valid number',
      'number.positive': 'Total supply must be greater than 0',
      'number.max': 'Total supply cannot exceed 1,000,000,000,000,000'
    }),
  
  decimals: Joi.number()
    .integer()
    .min(0)
    .max(18)
    .required()
    .messages({
      'number.base': 'Decimals must be a number',
      'number.integer': 'Decimals must be a whole number',
      'number.min': 'Decimals cannot be negative',
      'number.max': 'Decimals cannot exceed 18'
    })
});

// Payment request validation schema
const paymentRequestSchema = Joi.object({
  tokenConfig: tokenConfigSchema.required(),
  userAddress: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .required()
    .messages({
      'string.empty': 'User address is required',
      'string.pattern.base': 'Invalid Ethereum address format'
    })
});

// Deployment request validation schema
const deploymentRequestSchema = Joi.object({
  deploymentId: Joi.string()
    .guid({ version: 'uuidv4' })
    .required()
    .messages({
      'string.empty': 'Deployment ID is required',
      'string.guid': 'Invalid deployment ID format'
    }),
  
  tokenConfig: tokenConfigSchema.optional()
});

// User address validation schema
const userAddressSchema = Joi.string()
  .pattern(/^0x[a-fA-F0-9]{40}$/)
  .required()
  .messages({
    'string.empty': 'User address is required',
    'string.pattern.base': 'Invalid Ethereum address format'
  });

/**
 * Validate payment request data
 * @param {Object} data - Request data to validate
 * @returns {Object} Validation result
 */
export function validatePaymentRequest(data) {
  return paymentRequestSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * Validate deployment request data
 * @param {Object} data - Request data to validate
 * @param {boolean} requireTokenConfig - Whether token config is required
 * @returns {Object} Validation result
 */
export function validateDeploymentRequest(data, requireTokenConfig = true) {
  let schema = deploymentRequestSchema;
  
  if (requireTokenConfig) {
    schema = deploymentRequestSchema.keys({
      tokenConfig: tokenConfigSchema.required()
    });
  }
  
  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * Validate token configuration
 * @param {Object} data - Token config to validate
 * @returns {Object} Validation result
 */
export function validateTokenConfig(data) {
  return tokenConfigSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {Object} Validation result
 */
export function validateUserAddress(address) {
  return userAddressSchema.validate(address);
}

/**
 * Sanitize token name for safe usage
 * @param {string} name - Token name
 * @returns {string} Sanitized name
 */
export function sanitizeTokenName(name) {
  return name
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s\-_]/g, '') // Remove special characters except allowed ones
    .substring(0, 50); // Ensure max length
}

/**
 * Sanitize token symbol for safe usage
 * @param {string} symbol - Token symbol
 * @returns {string} Sanitized symbol
 */
export function sanitizeTokenSymbol(symbol) {
  return symbol
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // Remove non-alphanumeric characters
    .substring(0, 10); // Ensure max length
}

/**
 * Validate and format total supply
 * @param {string} totalSupply - Total supply string
 * @returns {Object} Validation and formatting result
 */
export function validateAndFormatSupply(totalSupply) {
  const validation = Joi.string()
    .pattern(/^\d+(\.\d+)?$/)
    .required()
    .validate(totalSupply);
    
  if (validation.error) {
    return { error: validation.error, value: null };
  }
  
  const num = parseFloat(totalSupply);
  
  if (num <= 0) {
    return { 
      error: new Error('Total supply must be greater than 0'), 
      value: null 
    };
  }
  
  if (num > 1e15) {
    return { 
      error: new Error('Total supply cannot exceed 1,000,000,000,000,000'), 
      value: null 
    };
  }
  
  // Format to remove unnecessary decimal places
  const formatted = num.toString();
  
  return { error: null, value: formatted };
}

/**
 * Check if token name is potentially problematic
 * @param {string} name - Token name
 * @returns {Object} Check result
 */
export function checkTokenNameSafety(name) {
  const warnings = [];
  const errors = [];
  
  // Check for common scam patterns
  const scamPatterns = [
    /bitcoin/i,
    /ethereum/i,
    /binance/i,
    /coinbase/i,
    /uniswap/i,
    /metamask/i
  ];
  
  for (const pattern of scamPatterns) {
    if (pattern.test(name)) {
      warnings.push(`Token name contains "${name.match(pattern)[0]}" which may be misleading`);
    }
  }
  
  // Check for excessive length or unusual characters
  if (name.length > 30) {
    warnings.push('Token name is quite long, consider shortening it');
  }
  
  if (/^\s|\s$/.test(name)) {
    errors.push('Token name should not start or end with spaces');
  }
  
  return {
    safe: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Check if token symbol is potentially problematic
 * @param {string} symbol - Token symbol
 * @returns {Object} Check result
 */
export function checkTokenSymbolSafety(symbol) {
  const warnings = [];
  const errors = [];
  
  // Check for common token symbols that might be confusing
  const reservedSymbols = [
    'BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'ADA', 'SOL', 'DOT', 'MATIC', 'AVAX',
    'LINK', 'UNI', 'ATOM', 'XRP', 'DOGE', 'SHIB', 'LTC', 'BCH', 'ETC', 'FIL'
  ];
  
  if (reservedSymbols.includes(symbol.toUpperCase())) {
    errors.push(`Symbol "${symbol}" is already used by a major cryptocurrency`);
  }
  
  // Check for potentially confusing symbols
  if (symbol.length < 2) {
    warnings.push('Token symbol is very short, consider using 3-5 characters');
  }
  
  if (symbol.length > 6) {
    warnings.push('Token symbol is quite long, consider shortening it');
  }
  
  return {
    safe: errors.length === 0,
    warnings,
    errors
  };
}
