import { ethers } from 'ethers';
import { Alchemy, Network } from 'alchemy-sdk';

// OpenZeppelin ERC20 contract ABI (simplified for deployment)
const ERC20_ABI = [
  "constructor(string memory name, string memory symbol, uint256 totalSupply, uint8 decimals)",
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function decimals() public view returns (uint8)",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)",
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) public returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// Simplified ERC20 contract bytecode (this would normally be compiled from Solidity)
// This is a placeholder - in production, you'd use the actual compiled bytecode
const ERC20_BYTECODE = "0x608060405234801561001057600080fd5b506040516108a93803806108a98339818101604052810190610032919061028a565b8360039081610041919061053b565b50826004908161005191906105..."; // Truncated for brevity

// Initialize Alchemy provider
const alchemyConfig = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET, // Use BASE_SEPOLIA for testnet
};

const alchemy = new Alchemy(alchemyConfig);
const provider = alchemy.core;

// Create wallet from private key
const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

/**
 * Deploy an ERC20 token contract to Base network
 * @param {Object} tokenParams - Token parameters
 * @param {string} tokenParams.name - Token name
 * @param {string} tokenParams.symbol - Token symbol
 * @param {string} tokenParams.totalSupply - Total supply (as string)
 * @param {number} tokenParams.decimals - Number of decimals
 * @returns {Promise<Object>} Deployment result
 */
export async function deployToken({ name, symbol, totalSupply, decimals }) {
  try {
    console.log(`🚀 Starting deployment for ${name} (${symbol})`);
    
    // Validate inputs
    if (!name || !symbol || !totalSupply || decimals === undefined) {
      throw new Error('Missing required token parameters');
    }

    // Convert total supply to BigNumber with decimals
    const totalSupplyBN = ethers.parseUnits(totalSupply, decimals);
    
    // Create contract factory
    const contractFactory = new ethers.ContractFactory(
      ERC20_ABI,
      ERC20_BYTECODE,
      wallet
    );

    // Estimate gas for deployment
    const deploymentData = contractFactory.interface.encodeDeploy([
      name,
      symbol,
      totalSupplyBN,
      decimals
    ]);

    const gasEstimate = await provider.estimateGas({
      data: ERC20_BYTECODE + deploymentData.slice(2),
      from: wallet.address
    });

    console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);

    // Get current gas price
    const gasPrice = await provider.getGasPrice();
    console.log(`💰 Gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);

    // Deploy contract with some buffer on gas limit
    const gasLimit = gasEstimate * BigInt(120) / BigInt(100); // 20% buffer
    
    const contract = await contractFactory.deploy(
      name,
      symbol,
      totalSupplyBN,
      decimals,
      {
        gasLimit,
        gasPrice
      }
    );

    console.log(`📄 Contract deployed to: ${contract.target}`);
    console.log(`🔗 Transaction hash: ${contract.deploymentTransaction().hash}`);

    // Wait for deployment confirmation
    const receipt = await contract.deploymentTransaction().wait();
    
    if (receipt.status !== 1) {
      throw new Error('Contract deployment failed');
    }

    console.log(`✅ Contract deployed successfully in block ${receipt.blockNumber}`);

    // Calculate actual gas cost
    const gasCost = receipt.gasUsed * receipt.gasPrice;
    const gasCostEth = ethers.formatEther(gasCost);

    return {
      contractAddress: contract.target,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      gasCost: gasCostEth,
      deployerAddress: wallet.address
    };

  } catch (error) {
    console.error('❌ Token deployment failed:', error);
    throw new Error(`Token deployment failed: ${error.message}`);
  }
}

/**
 * Get token information from deployed contract
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Object>} Token information
 */
export async function getTokenInfo(contractAddress) {
  try {
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);

    return {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: ethers.formatUnits(totalSupply, decimals),
      contractAddress
    };

  } catch (error) {
    console.error('❌ Failed to get token info:', error);
    throw new Error(`Failed to get token info: ${error.message}`);
  }
}

/**
 * Estimate gas cost for token deployment
 * @param {Object} tokenParams - Token parameters
 * @returns {Promise<Object>} Gas estimation
 */
export async function estimateDeploymentGas({ name, symbol, totalSupply, decimals }) {
  try {
    const totalSupplyBN = ethers.parseUnits(totalSupply, decimals);
    
    const contractFactory = new ethers.ContractFactory(
      ERC20_ABI,
      ERC20_BYTECODE,
      wallet
    );

    const deploymentData = contractFactory.interface.encodeDeploy([
      name,
      symbol,
      totalSupplyBN,
      decimals
    ]);

    const gasEstimate = await provider.estimateGas({
      data: ERC20_BYTECODE + deploymentData.slice(2),
      from: wallet.address
    });

    const gasPrice = await provider.getGasPrice();
    const estimatedCost = gasEstimate * gasPrice;

    return {
      gasLimit: gasEstimate.toString(),
      gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
      estimatedCost: ethers.formatEther(estimatedCost),
      estimatedCostUSD: '0.00' // Would need price oracle for accurate USD conversion
    };

  } catch (error) {
    console.error('❌ Gas estimation failed:', error);
    throw new Error(`Gas estimation failed: ${error.message}`);
  }
}

/**
 * Check if contract is verified on BaseScan
 * @param {string} contractAddress - Contract address
 * @returns {Promise<boolean>} Verification status
 */
export async function isContractVerified(contractAddress) {
  try {
    // This would typically call BaseScan API to check verification status
    // For now, we'll return false as a placeholder
    return false;
  } catch (error) {
    console.error('❌ Failed to check verification status:', error);
    return false;
  }
}

/**
 * Get network information
 * @returns {Promise<Object>} Network info
 */
export async function getNetworkInfo() {
  try {
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    const gasPrice = await provider.getGasPrice();

    return {
      chainId: Number(network.chainId),
      name: network.name,
      blockNumber,
      gasPrice: ethers.formatUnits(gasPrice, 'gwei')
    };

  } catch (error) {
    console.error('❌ Failed to get network info:', error);
    throw new Error(`Failed to get network info: ${error.message}`);
  }
}
