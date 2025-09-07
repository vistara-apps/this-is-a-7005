import axios from 'axios';
import { getDatabase } from '../database/init.js';

/**
 * Verify contract source code on BaseScan
 * @param {Object} params - Verification parameters
 * @param {string} params.contractAddress - Contract address
 * @param {string} params.deploymentId - Deployment ID
 * @param {string} params.tokenName - Token name
 * @param {string} params.tokenSymbol - Token symbol
 * @param {string} params.totalSupply - Total supply
 * @param {number} params.decimals - Decimals
 * @returns {Promise<Object>} Verification result
 */
export async function verifyContract({
  contractAddress,
  deploymentId,
  tokenName,
  tokenSymbol,
  totalSupply,
  decimals
}) {
  try {
    console.log(`🔍 Starting contract verification for ${contractAddress}`);
    
    const db = getDatabase();
    
    // Update verification status to in_progress
    await db.runAsync(
      'UPDATE token_deployments SET verificationStatus = ? WHERE deploymentId = ?',
      ['in_progress', deploymentId]
    );

    // Prepare verification data
    const verificationData = {
      apikey: process.env.BASESCAN_API_KEY,
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: contractAddress,
      sourceCode: getERC20SourceCode(tokenName, tokenSymbol, totalSupply, decimals),
      codeformat: 'solidity-single-file',
      contractname: 'ERC20Token',
      compilerversion: 'v0.8.19+commit.7dd6d404',
      optimizationUsed: '1',
      runs: '200',
      constructorArguements: getConstructorArguments(tokenName, tokenSymbol, totalSupply, decimals),
      evmversion: 'default',
      licenseType: '3' // MIT License
    };

    // Submit verification request to BaseScan
    const verificationResponse = await axios.post(
      'https://api.basescan.org/api',
      new URLSearchParams(verificationData),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (verificationResponse.data.status !== '1') {
      throw new Error(`Verification submission failed: ${verificationResponse.data.result}`);
    }

    const guid = verificationResponse.data.result;
    console.log(`📝 Verification submitted with GUID: ${guid}`);

    // Poll for verification status
    const verificationResult = await pollVerificationStatus(guid);
    
    // Update database with verification result
    await db.runAsync(
      'UPDATE token_deployments SET verificationStatus = ? WHERE deploymentId = ?',
      [verificationResult.success ? 'verified' : 'failed', deploymentId]
    );

    console.log(`✅ Contract verification ${verificationResult.success ? 'completed' : 'failed'}`);
    
    return verificationResult;

  } catch (error) {
    console.error('❌ Contract verification failed:', error);
    
    // Update verification status to failed
    const db = getDatabase();
    await db.runAsync(
      'UPDATE token_deployments SET verificationStatus = ? WHERE deploymentId = ?',
      ['failed', deploymentId]
    );

    throw new Error(`Contract verification failed: ${error.message}`);
  }
}

/**
 * Poll BaseScan for verification status
 * @param {string} guid - Verification GUID
 * @returns {Promise<Object>} Verification result
 */
async function pollVerificationStatus(guid) {
  const maxAttempts = 30; // 5 minutes with 10-second intervals
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const statusResponse = await axios.get('https://api.basescan.org/api', {
        params: {
          apikey: process.env.BASESCAN_API_KEY,
          module: 'contract',
          action: 'checkverifystatus',
          guid: guid
        }
      });

      const result = statusResponse.data.result;
      
      if (result === 'Pass - Verified') {
        return {
          success: true,
          status: 'verified',
          message: 'Contract successfully verified'
        };
      } else if (result === 'Fail - Unable to verify') {
        return {
          success: false,
          status: 'failed',
          message: 'Contract verification failed'
        };
      } else if (result.includes('Pending')) {
        // Still processing, wait and try again
        console.log(`⏳ Verification pending... (attempt ${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        attempts++;
        continue;
      } else {
        // Unknown status
        console.log(`❓ Unknown verification status: ${result}`);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10000));
        continue;
      }

    } catch (error) {
      console.error('Error checking verification status:', error);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  // Timeout reached
  return {
    success: false,
    status: 'timeout',
    message: 'Verification timeout - please check BaseScan manually'
  };
}

/**
 * Generate ERC20 source code for verification
 * @param {string} name - Token name
 * @param {string} symbol - Token symbol
 * @param {string} totalSupply - Total supply
 * @param {number} decimals - Decimals
 * @returns {string} Solidity source code
 */
function getERC20SourceCode(name, symbol, totalSupply, decimals) {
  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract ERC20Token is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    uint8 private _decimals;

    constructor(string memory name_, string memory symbol_, uint256 totalSupply_, uint8 decimals_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        _totalSupply = totalSupply_ * 10**decimals_;
        _balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        address owner = msg.sender;
        _transfer(owner, to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        address owner = msg.sender;
        _approve(owner, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
            _balances[to] += amount;
        }

        emit Transfer(from, to, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _spendAllowance(address owner, address spender, uint256 amount) internal {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }
}`;
}

/**
 * Generate constructor arguments for verification
 * @param {string} name - Token name
 * @param {string} symbol - Token symbol
 * @param {string} totalSupply - Total supply
 * @param {number} decimals - Decimals
 * @returns {string} Encoded constructor arguments
 */
function getConstructorArguments(name, symbol, totalSupply, decimals) {
  // This would typically use ethers.js to encode the constructor arguments
  // For now, returning empty string as placeholder
  // In production, you'd use: ethers.utils.defaultAbiCoder.encode(...)
  return '';
}

/**
 * Check verification status for a contract
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Object>} Verification status
 */
export async function checkVerificationStatus(contractAddress) {
  try {
    const response = await axios.get('https://api.basescan.org/api', {
      params: {
        module: 'contract',
        action: 'getsourcecode',
        address: contractAddress,
        apikey: process.env.BASESCAN_API_KEY
      }
    });

    const result = response.data.result[0];
    
    return {
      isVerified: result.SourceCode !== '',
      contractName: result.ContractName,
      compilerVersion: result.CompilerVersion,
      optimizationUsed: result.OptimizationUsed,
      runs: result.Runs
    };

  } catch (error) {
    console.error('❌ Failed to check verification status:', error);
    return {
      isVerified: false,
      error: error.message
    };
  }
}
