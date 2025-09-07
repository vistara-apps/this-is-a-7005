# BaseToken Forge Backend

Backend API service for BaseToken Forge - a web-based tool for deploying ERC-20 tokens on the Base network.

## Features

- 🚀 **Token Deployment**: Deploy secure ERC-20 tokens to Base network
- 💳 **Payment Processing**: Stripe integration for $25 deployment fee
- 🔍 **Contract Verification**: Automatic BaseScan contract verification
- 📊 **Database Storage**: SQLite database for deployment tracking
- 🛡️ **Security**: Rate limiting, input validation, and secure API design
- ⛽ **Gas Estimation**: Real-time gas cost estimation
- 🔗 **Alchemy Integration**: Reliable Base network connectivity

## Tech Stack

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: SQLite with async/await support
- **Blockchain**: Ethers.js v6 + Alchemy SDK
- **Payments**: Stripe API
- **Validation**: Joi schema validation
- **Security**: Helmet, CORS, Rate limiting

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Stripe account (for payments)
- Alchemy account (for Base network access)
- BaseScan API key (for contract verification)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=./database.sqlite

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Alchemy Configuration (Base Network)
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Private Key for Contract Deployment (KEEP SECURE!)
DEPLOYER_PRIVATE_KEY=your_deployer_private_key_here

# BaseScan API Key for Contract Verification
BASESCAN_API_KEY=your_basescan_api_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system status

### Payment
- `POST /api/payment/create-intent` - Create Stripe payment intent
- `POST /api/payment/webhook` - Stripe webhook handler
- `GET /api/payment/status/:sessionId` - Get payment status

### Deployment
- `POST /api/deployment/deploy` - Deploy token contract
- `GET /api/deployment/status/:deploymentId` - Get deployment status
- `GET /api/deployment/user/:userAddress` - Get user's deployments
- `POST /api/deployment/estimate-gas` - Estimate deployment gas cost

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  userId TEXT PRIMARY KEY,
  email TEXT,
  walletAddress TEXT,
  paymentHistory TEXT DEFAULT '[]',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Token Deployments Table
```sql
CREATE TABLE token_deployments (
  deploymentId TEXT PRIMARY KEY,
  userId TEXT,
  tokenName TEXT NOT NULL,
  tokenSymbol TEXT NOT NULL,
  totalSupply TEXT NOT NULL,
  decimals INTEGER NOT NULL DEFAULT 18,
  contractAddress TEXT,
  transactionHash TEXT,
  deploymentTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending',
  paymentIntentId TEXT,
  gasUsed TEXT,
  gasCost TEXT,
  verificationStatus TEXT DEFAULT 'pending',
  baseScanUrl TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users (userId)
);
```

### Payment Sessions Table
```sql
CREATE TABLE payment_sessions (
  sessionId TEXT PRIMARY KEY,
  userId TEXT,
  deploymentId TEXT,
  stripePaymentIntentId TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  paymentMethod TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users (userId),
  FOREIGN KEY (deploymentId) REFERENCES token_deployments (deploymentId)
);
```

## Deployment Flow

1. **Payment Intent Creation**:
   - User submits token configuration
   - System creates deployment record
   - Stripe payment intent created
   - Returns client secret for frontend

2. **Payment Processing**:
   - Stripe webhook confirms payment
   - Deployment status updated to 'paid'
   - Triggers deployment process

3. **Token Deployment**:
   - Contract deployed to Base network
   - Transaction confirmed
   - Contract address recorded

4. **Contract Verification**:
   - Source code submitted to BaseScan
   - Verification status polled
   - Database updated with results

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Joi schema validation for all inputs
- **CORS Protection**: Configurable origin restrictions
- **Helmet Security**: Security headers and protections
- **Private Key Security**: Environment-based key management
- **Webhook Verification**: Stripe signature verification

## Error Handling

The API uses consistent error response format:

```json
{
  "error": "Error Type",
  "message": "Human readable error message",
  "details": "Additional error details (optional)"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Development

### Running Tests
```bash
npm test
```

### Code Style
The project uses ESLint and Prettier for code formatting.

### Database Migrations
Database schema is automatically created on first run. For production, consider using proper migration tools.

## Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use production Stripe keys
3. Configure proper CORS origins
4. Set up SSL/TLS termination
5. Use production database (PostgreSQL recommended)

### Security Checklist
- [ ] Environment variables secured
- [ ] Private keys in secure storage
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Database backups enabled
- [ ] Monitoring and logging set up

## Monitoring

The `/api/health/detailed` endpoint provides comprehensive system status including:
- Database connectivity
- External service configuration
- Memory usage
- Uptime statistics

## Support

For issues and questions:
1. Check the API documentation
2. Review error logs
3. Verify environment configuration
4. Test with health check endpoints

## License

MIT License - see LICENSE file for details.
