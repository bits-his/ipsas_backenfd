# IPSAS Accounting System API

A comprehensive IPSAS-compliant public sector accounting system built with Node.js, TypeScript, and PostgreSQL.

## Features

- **IPSAS Compliance**: Full compliance with International Public Sector Accounting Standards
- **Fund Accounting**: Multi-fund support with proper segregation
- **Chart of Accounts**: Hierarchical account structure with validation
- **General Ledger**: Complete journal entry system with approval workflow
- **Audit Trail**: Comprehensive tracking of all financial transactions
- **Security**: JWT authentication with role-based access control
- **API Documentation**: Auto-generated Swagger documentation

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Docker (optional)

### Installation

1. **Clone and Install**
   \`\`\`bash
   git clone <repository-url>
   cd ipsas-accounting-api
   npm install
   \`\`\`

2. **Environment Setup**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. **Database Setup**
   \`\`\`bash
   # Start PostgreSQL (or use Docker Compose)
   docker-compose up postgres -d
   
   # Run migrations
   npm run migrate
   
   # Seed initial data
   npm run seed
   \`\`\`

4. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Access API Documentation**
   - API: http://localhost:3000/api/v1
   - Swagger Docs: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health

## API Usage Examples

### Create a Chart of Account
\`\`\`bash
curl -X POST http://localhost:3000/api/v1/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "accountCode": "1000",
    "accountName": "Cash and Cash Equivalents",
    "accountType": "ASSET",
    "fundId": "fund-uuid",
    "entityId": "entity-uuid",
    "description": "Operating cash accounts"
  }'
\`\`\`

### Create a Journal Entry
\`\`\`bash
curl -X POST http://localhost:3000/api/v1/journal-entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "transactionDate": "2024-01-15",
    "postingDate": "2024-01-15",
    "description": "Cash receipt from tax collection",
    "fundId": "fund-uuid",
    "entityId": "entity-uuid",
    "entries": [
      {
        "accountId": "cash-account-uuid",
        "debitAmount": 10000.00,
        "description": "Cash received"
      },
      {
        "accountId": "revenue-account-uuid", 
        "creditAmount": 10000.00,
        "description": "Tax revenue recognized"
      }
    ]
  }'
\`\`\`

## IPSAS Compliance Features

- **Fund Accounting**: Multi-fund support with proper segregation
- **Accrual Basis**: Full accrual accounting with proper revenue recognition
- **Financial Statements**: IPSAS-compliant trial balance and statements
- **Audit Trail**: Comprehensive tracking of all financial transactions
- **Budget Integration**: Budget vs actual reporting (to be implemented)
- **Asset Management**: Fixed asset tracking with depreciation (to be implemented)

## Architecture Highlights

- **MVC Pattern**: Clean separation of concerns
- **Type Safety**: Full TypeScript implementation
- **Validation**: Comprehensive input validation with Joi
- **Authentication**: JWT-based authentication with role-based access
- **Audit Logging**: Complete audit trail for compliance
- **Error Handling**: Robust error handling and logging
- **API Documentation**: Auto-generated Swagger documentation
- **Testing Ready**: Structure prepared for comprehensive testing

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with initial data
- `npm test` - Run tests
- `npm run lint` - Lint code

## Docker Deployment

\`\`\`bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f app
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
# ipsas_backenfd
