import express from 'express';
import { getDatabase } from '../database/init.js';

const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    
    // Test database connection
    await db.getAsync('SELECT 1 as test');
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'connected',
        api: 'running'
      },
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    
    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'disconnected',
        api: 'running'
      },
      environment: process.env.NODE_ENV || 'development',
      error: error.message
    };
    
    res.status(503).json(healthStatus);
  }
});

// Detailed health check for monitoring
router.get('/detailed', async (req, res) => {
  try {
    const db = getDatabase();
    
    // Test database with more detailed queries
    const userCount = await db.getAsync('SELECT COUNT(*) as count FROM users');
    const deploymentCount = await db.getAsync('SELECT COUNT(*) as count FROM token_deployments');
    
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        database: {
          status: 'connected',
          users: userCount.count,
          deployments: deploymentCount.count
        },
        api: {
          status: 'running',
          port: process.env.PORT || 3001
        },
        external: {
          stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured',
          alchemy: process.env.ALCHEMY_API_KEY ? 'configured' : 'not configured',
          basescan: process.env.BASESCAN_API_KEY ? 'configured' : 'not configured'
        }
      },
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.status(200).json(detailedHealth);
  } catch (error) {
    console.error('Detailed health check failed:', error);
    
    const detailedHealth = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        database: {
          status: 'error',
          error: error.message
        },
        api: {
          status: 'running',
          port: process.env.PORT || 3001
        }
      },
      environment: process.env.NODE_ENV || 'development',
      error: error.message
    };
    
    res.status(503).json(detailedHealth);
  }
});

export default router;
