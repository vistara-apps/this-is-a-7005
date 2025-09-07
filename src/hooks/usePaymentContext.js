import { useAccount } from "wagmi";
import { useCallback } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export function usePaymentContext() {
  const { address, isConnected } = useAccount();

  const createPaymentIntent = useCallback(async (tokenConfig) => {
    if (!isConnected || !address) {
      throw new Error("Please connect your wallet");
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payment/create-intent`, {
        tokenConfig,
        userAddress: address
      });
      
      return response.data;
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw new Error(error.response?.data?.message || 'Payment intent creation failed');
    }
  }, [address, isConnected]);

  const checkPaymentStatus = useCallback(async (sessionId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payment/status/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Payment status check failed:', error);
      throw new Error(error.response?.data?.message || 'Payment status check failed');
    }
  }, []);

  const deployToken = useCallback(async (deploymentId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/deployment/deploy`, {
        deploymentId
      });
      
      return response.data;
    } catch (error) {
      console.error('Token deployment failed:', error);
      throw new Error(error.response?.data?.message || 'Token deployment failed');
    }
  }, []);

  const checkDeploymentStatus = useCallback(async (deploymentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/deployment/status/${deploymentId}`);
      return response.data;
    } catch (error) {
      console.error('Deployment status check failed:', error);
      throw new Error(error.response?.data?.message || 'Deployment status check failed');
    }
  }, []);

  const getUserDeployments = useCallback(async () => {
    if (!address) {
      throw new Error("Wallet not connected");
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/deployment/user/${address}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user deployments:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch deployments');
    }
  }, [address]);

  return { 
    createPaymentIntent,
    checkPaymentStatus,
    deployToken,
    checkDeploymentStatus,
    getUserDeployments
  };
}
