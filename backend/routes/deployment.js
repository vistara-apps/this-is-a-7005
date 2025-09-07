import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/init.js';
import { deployToken } from '../services/blockchain.js';
import { verifyContract } from '../services/verification.js';
import { validateDeploymentRequest } from '../utils/validation.js';

const router = express.Router();

// Deploy token contract
router.post('/deploy', async (req, res) => {
  try {
    const { error, value } = validateDeploymentRequest(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const { deploymentId } = value;
    const db = getDatabase();

    // Get deployment record
    const deployment = await db.getAsync(
      'SELECT * FROM token_deployments WHERE deploymentId = ? AND status = ?',
      [deploymentId, 'paid']
    );

    if (!deployment) {
      return res.status(404).json({
        error: 'Deployment Not Found',
        message: 'Deployment not found or payment not completed'
      });
    }

    // Update status to deploying
    await db.runAsync(
      'UPDATE token_deployments SET status = ? WHERE deploymentId = ?',
      ['deploying', deploymentId]
    );

    try {
      // Deploy the token contract
      const deploymentResult = await deployToken({
        name: deployment.tokenName,
        symbol: deployment.tokenSymbol,
        totalSupply: deployment.totalSupply,
        decimals: deployment.decimals
      });

      // Update deployment record with contract details
      await db.runAsync(`
        UPDATE token_deployments SET 
          contractAddress = ?, 
          transactionHash = ?, 
          gasUsed = ?, 
          gasCost = ?, 
          status = ?,
          baseScanUrl = ?
        WHERE deploymentId = ?
      `, [
        deploymentResult.contractAddress,
        deploymentResult.transactionHash,
        deploymentResult.gasUsed,
        deploymentResult.gasCost,
        'deployed',
        `https://basescan.org/address/${deploymentResult.contractAddress}`,
        deploymentId
      ]);

      // Start contract verification process (async)
      verifyContract({
        contractAddress: deploymentResult.contractAddress,
        deploymentId,
        tokenName: deployment.tokenName,
        tokenSymbol: deployment.tokenSymbol,
        totalSupply: deployment.totalSupply,
        decimals: deployment.decimals
      }).catch(error => {
        console.error('Contract verification failed:', error);
        // Update verification status to failed
        db.runAsync(
          'UPDATE token_deployments SET verificationStatus = ? WHERE deploymentId = ?',
          ['failed', deploymentId]
        );
      });

      res.status(200).json({
        success: true,
        deployment: {
          deploymentId,
          contractAddress: deploymentResult.contractAddress,
          transactionHash: deploymentResult.transactionHash,
          baseScanUrl: `https://basescan.org/address/${deploymentResult.contractAddress}`,
          gasUsed: deploymentResult.gasUsed,
          gasCost: deploymentResult.gasCost,
          status: 'deployed',
          verificationStatus: 'pending'
        }
      });

    } catch (deploymentError) {
      console.error('Token deployment failed:', deploymentError);
      
      // Update status to failed
      await db.runAsync(
        'UPDATE token_deployments SET status = ? WHERE deploymentId = ?',
        ['failed', deploymentId]
      );

      res.status(500).json({
        error: 'Deployment Failed',
        message: deploymentError.message
      });
    }

  } catch (error) {
    console.error('Deployment endpoint error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get deployment status
router.get('/status/:deploymentId', async (req, res) => {
  try {
    const { deploymentId } = req.params;
    const db = getDatabase();

    const deployment = await db.getAsync(
      'SELECT * FROM token_deployments WHERE deploymentId = ?',
      [deploymentId]
    );

    if (!deployment) {
      return res.status(404).json({
        error: 'Deployment Not Found',
        message: 'Deployment not found'
      });
    }

    res.status(200).json({
      success: true,
      deployment: {
        deploymentId: deployment.deploymentId,
        tokenName: deployment.tokenName,
        tokenSymbol: deployment.tokenSymbol,
        totalSupply: deployment.totalSupply,
        decimals: deployment.decimals,
        contractAddress: deployment.contractAddress,
        transactionHash: deployment.transactionHash,
        status: deployment.status,
        verificationStatus: deployment.verificationStatus,
        baseScanUrl: deployment.baseScanUrl,
        gasUsed: deployment.gasUsed,
        gasCost: deployment.gasCost,
        deploymentTimestamp: deployment.deploymentTimestamp,
        createdAt: deployment.createdAt
      }
    });

  } catch (error) {
    console.error('Deployment status check failed:', error);
    res.status(500).json({
      error: 'Status Check Failed',
      message: error.message
    });
  }
});

// Get user's deployments
router.get('/user/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const db = getDatabase();

    // Get user
    const user = await db.getAsync(
      'SELECT userId FROM users WHERE walletAddress = ?',
      [userAddress]
    );

    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    // Get user's deployments
    const deployments = await db.allAsync(`
      SELECT 
        deploymentId, tokenName, tokenSymbol, totalSupply, decimals,
        contractAddress, transactionHash, status, verificationStatus,
        baseScanUrl, gasUsed, gasCost, deploymentTimestamp, createdAt
      FROM token_deployments 
      WHERE userId = ? 
      ORDER BY createdAt DESC
    `, [user.userId]);

    res.status(200).json({
      success: true,
      deployments
    });

  } catch (error) {
    console.error('User deployments fetch failed:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// Estimate gas cost for deployment
router.post('/estimate-gas', async (req, res) => {
  try {
    const { error, value } = validateDeploymentRequest(req.body, false);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const { tokenConfig } = value;

    // This would typically call the blockchain service to estimate gas
    // For now, we'll return a mock estimate
    const gasEstimate = {
      gasLimit: '2100000',
      gasPrice: '0.000000020', // 20 gwei
      estimatedCost: '0.042', // ETH
      estimatedCostUSD: '100.00' // Approximate USD value
    };

    res.status(200).json({
      success: true,
      gasEstimate
    });

  } catch (error) {
    console.error('Gas estimation failed:', error);
    res.status(500).json({
      error: 'Gas Estimation Failed',
      message: error.message
    });
  }
});

export default router;
