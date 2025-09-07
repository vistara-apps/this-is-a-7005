# BaseToken Forge

**Launch your token on Base in minutes, no code required.**

BaseToken Forge is a comprehensive web application that enables creators and communities to easily deploy secure ERC-20 tokens on the Base network without any coding knowledge. Built with modern web technologies and integrated with professional blockchain infrastructure.

![BaseToken Forge Screenshot](https://via.placeholder.com/800x400/6366f1/ffffff?text=BaseToken+Forge)

## 🚀 Features

### Core Functionality
- **🎯 Token Configuration Wizard**: Step-by-step interface for defining token parameters
- **💳 Integrated Payments**: Stripe integration for seamless $25 deployment fee
- **⚡ One-Click Deployment**: Automated contract deployment to Base network
- **🔍 Contract Verification**: Automatic BaseScan source code verification
- **📊 Deployment Tracking**: Real-time status updates and transaction monitoring
- **🛡️ Security First**: Pre-audited OpenZeppelin-based contracts

### Technical Features
- **🔗 Wallet Integration**: RainbowKit for seamless wallet connections
- **⛽ Gas Estimation**: Real-time deployment cost calculations
- **📱 Responsive Design**: Works perfectly on desktop and mobile
- **🎨 Modern UI**: Beautiful gradient design with smooth animations
- **🔒 Input Validation**: Comprehensive client and server-side validation

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite for fast development
- **Styling**: Tailwind CSS with custom design system
- **Wallet**: RainbowKit + Wagmi for Web3 integration
- **State Management**: React hooks and context
- **HTTP Client**: Axios for API communication

### Backend (Node.js + Express)
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js with comprehensive middleware
- **Database**: SQLite with async/await support
- **Blockchain**: Ethers.js v6 + Alchemy SDK
- **Payments**: Stripe API integration
- **Security**: Helmet, CORS, rate limiting, input validation

### Infrastructure
- **Blockchain**: Base network (Ethereum L2)
- **Node Provider**: Alchemy for reliable connectivity
- **Payment Processing**: Stripe for secure transactions
- **Contract Verification**: BaseScan API integration

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vistara-apps/basetoken-forge.git
   cd basetoken-forge
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Environment setup**:
   ```bash
   # Frontend environment
   cp .env.example .env
   
   # Backend environment
   cp backend/.env.example backend/.env
   # Edit backend/.env with your API keys
   ```

5. **Start development servers**:
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend
   cd backend
   npm run dev
   ```

6. **Open your browser**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 🔧 Configuration

### Frontend Environment Variables
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
VITE_CHAIN_ID=8453
```

### Backend Environment Variables
```env
# Required for production
STRIPE_SECRET_KEY=sk_live_your_stripe_key
ALCHEMY_API_KEY=your_alchemy_key
DEPLOYER_PRIVATE_KEY=your_deployer_private_key
BASESCAN_API_KEY=your_basescan_key

# Optional configurations
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

## 📋 API Documentation

### Payment Endpoints
- `POST /api/payment/create-intent` - Create Stripe payment intent
- `GET /api/payment/status/:sessionId` - Check payment status
- `POST /api/payment/webhook` - Stripe webhook handler

### Deployment Endpoints
- `POST /api/deployment/deploy` - Deploy token contract
- `GET /api/deployment/status/:deploymentId` - Get deployment status
- `GET /api/deployment/user/:userAddress` - Get user deployments
- `POST /api/deployment/estimate-gas` - Estimate gas costs

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system status

## 🔒 Security Features

- **Input Validation**: Joi schema validation on all inputs
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable origin restrictions
- **Helmet Security**: Comprehensive security headers
- **Private Key Security**: Environment-based key management
- **Webhook Verification**: Stripe signature verification
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy headers

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Set environment variables in your hosting dashboard

### Backend Deployment (Railway/Heroku/VPS)
1. Set all required environment variables
2. Ensure database is accessible
3. Configure SSL/TLS termination
4. Set up monitoring and logging

### Production Checklist
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] SSL certificates installed
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Rate limiting tuned for production
- [ ] CORS origins restricted

## 🧪 Testing

### Frontend Tests
```bash
npm run test
```

### Backend Tests
```bash
cd backend
npm run test
```

### Manual Testing
1. Connect wallet (MetaMask recommended)
2. Configure token parameters
3. Review deployment summary
4. Complete payment process
5. Monitor deployment status
6. Verify contract on BaseScan

## 📊 Monitoring

### Health Checks
- Frontend: Check if app loads and wallet connects
- Backend: `GET /api/health/detailed` for system status
- Database: Connection and query performance
- External APIs: Stripe, Alchemy, BaseScan connectivity

### Key Metrics
- Deployment success rate
- Payment completion rate
- Average deployment time
- Gas cost accuracy
- User satisfaction

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Frontend: ESLint + Prettier
- Backend: ESLint + Prettier
- Commits: Conventional Commits format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](backend/README.md)
- [Frontend Setup Guide](docs/frontend-setup.md)
- [Deployment Guide](docs/deployment.md)

### Getting Help
- 📧 Email: support@basetoken-forge.com
- 💬 Discord: [Join our community](https://discord.gg/basetoken-forge)
- 🐛 Issues: [GitHub Issues](https://github.com/vistara-apps/basetoken-forge/issues)

### FAQ
**Q: What networks are supported?**
A: Currently Base mainnet. Base Sepolia testnet support coming soon.

**Q: What's the deployment cost?**
A: $25 service fee + gas costs (typically $10-50 depending on network congestion).

**Q: Are the contracts audited?**
A: Yes, we use OpenZeppelin's audited ERC-20 implementation.

**Q: Can I customize the contract?**
A: Basic customization (name, symbol, supply, decimals) is supported. Advanced features coming soon.

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Basic ERC-20 deployment
- [x] Stripe payment integration
- [x] Contract verification
- [x] Responsive UI

### Phase 2 (Q1 2024)
- [ ] Advanced token features (burn, mint, pause)
- [ ] Batch deployment
- [ ] Token analytics dashboard
- [ ] Multi-network support

### Phase 3 (Q2 2024)
- [ ] Token marketplace integration
- [ ] Liquidity pool creation
- [ ] Governance token templates
- [ ] Mobile app

---

**Built with ❤️ by the BaseToken Forge team**

*Making token deployment accessible to everyone, one click at a time.*
