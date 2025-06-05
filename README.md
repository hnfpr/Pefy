# Personal Financial Dashboard

A comprehensive, self-hosted personal finance dashboard built with React, TypeScript, and Tailwind CSS. Track your spending, manage savings accounts, monitor investments, and visualize your financial data with beautiful charts.

## Features

### 📊 Dashboard Overview
- Real-time financial summary with key metrics
- Interactive line chart comparing spending targets vs actual spending
- Category-based spending visualization
- Net worth calculation and savings rate tracking

### 💸 Spending Tracker
- Add, edit, and delete spending entries
- Customizable spending categories
- Date picker with flexible date selection
- Category-based filtering and analytics
- Input validation and error prevention
- Monthly and all-time spending summaries

### 🏦 Savings Account Management
- Multiple savings accounts with bank details
- Transfer money between accounts with validation
- Balance tracking and account organization
- Edit and delete accounts with confirmation dialogs
- Total savings calculation across all accounts

### 📈 Investment Tracking
- Investment portfolio management
- Flexible update scheduling (monthly or custom)
- Notes and performance tracking
- Investment history with date-based sorting
- Portfolio summaries and analytics

### 🎨 User Experience
- Clean, minimalistic monochrome design
- Dark mode toggle with persistence
- Responsive design for desktop and mobile
- Toast notifications for user feedback
- Confirmation dialogs for destructive actions
- Export functionality for all data types (CSV)

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **UI Components**: Shadcn/ui components
- **Storage**: Browser LocalStorage (simulating SQLite)
- **Deployment**: Docker with Nginx
- **State Management**: React hooks and context

## 🐳 Docker Deployment (Self-Hosting)

This application is fully containerized and ready for self-hosting with Docker.

### Quick Start with Docker

```bash
# Clone the repository
git clone <your-repo-url>
cd "Personal Financial Dashboard"

# Start with Docker Compose (recommended)
docker-compose up -d

# Access the application
open http://localhost:3000
```

### Alternative Docker Setup

```bash
# Build the image
docker build -t personal-finance-dashboard .

# Run the container
docker run -d -p 3000:80 --name finance-dashboard personal-finance-dashboard
```

### Features of Docker Setup

- ✅ **Multi-stage build** for optimized image size
- ✅ **Nginx** for efficient static file serving
- ✅ **Health checks** for container monitoring
- ✅ **Security headers** and optimizations
- ✅ **Gzip compression** for faster loading
- ✅ **Production-ready** configuration

📖 **For detailed Docker setup instructions, troubleshooting, and production deployment guide, see [DOCKER_SETUP.md](./DOCKER_SETUP.md)**

## Quick Start

### Prerequisites
- Modern web browser with JavaScript enabled
- No server setup required - runs entirely in the browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd personal-financial-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## Usage Guide

### Getting Started

1. **Set Your Monthly Target**
   - Go to the Dashboard tab
   - Set your monthly spending target in the "Monthly Spending Target" section
   - This will be used for budget tracking and charts

2. **Add Your First Spending Entry**
   - Navigate to the "Spending" tab
   - Click "Add Entry"
   - Fill in the date, amount, category, and optional description
   - Click "Add Entry" to save

3. **Set Up Savings Accounts**
   - Go to the "Savings" tab
   - Click "Add Account"
   - Enter bank name, account name, and current balance
   - You can transfer money between accounts once you have multiple accounts

4. **Track Your Investments**
   - Navigate to the "Investments" tab
   - Click "Add Investment"
   - Enter investment name, amount, date, and optional notes
   - Update investments as needed to track performance

### Key Features

#### Spending Management
- **Categories**: Create custom categories or use defaults (Food, Transport, Entertainment, etc.)
- **Bulk Operations**: Edit or delete multiple entries
- **Filtering**: View spending by date range or category
- **Validation**: All inputs are validated to prevent errors

#### Account Transfers
- **Safe Transfers**: Built-in validation prevents overdrafts
- **Real-time Updates**: Balances update immediately after transfers
- **Transfer History**: All transfers are logged for transparency

#### Data Export
- **CSV Export**: Export spending, savings, or investment data
- **Date-stamped Files**: Exported files include the current date
- **Complete Data**: All fields are included in exports

#### Dark Mode
- **Toggle**: Switch between light and dark themes
- **Persistence**: Your preference is saved and restored
- **System Sync**: Can follow system preferences

## Data Storage

### Local Storage Structure
All data is stored in browser localStorage with the following keys:
- `financial_dashboard_spending`: Spending entries
- `financial_dashboard_savings`: Savings accounts
- `financial_dashboard_investments`: Investment records
- `financial_dashboard_settings`: App settings and preferences

### Data Backup
Since data is stored locally, consider regular exports:
1. Use the export buttons in the header
2. Save the CSV files to a secure location
3. Consider cloud storage for automatic backup

### Data Migration
To transfer data between devices:
1. Export all data from the source device
2. Import the CSV files on the new device (manual process)
3. Or copy localStorage data directly using browser developer tools

## Customization

### Adding New Categories
1. Go to Spending Tracker
2. When adding an entry, click the "+" button next to the category dropdown
3. Enter the new category name
4. The category will be available for future entries

### Modifying the Monthly Target
1. Go to Dashboard
2. Update the "Monthly Target" field
3. Click "Update Target"
4. Charts and calculations will update automatically

### Theme Customization
The app uses CSS custom properties for theming. You can modify `styles/globals.css` to customize:
- Colors (primary, secondary, accent, etc.)
- Typography (font sizes, weights)
- Spacing and layout
- Component styling

## Security Considerations

### Data Privacy
- All data stays on your device
- No external servers or third-party services
- No tracking or analytics
- Complete privacy and control

### Input Validation
- All numeric inputs are validated
- XSS prevention through proper escaping
- SQL injection not applicable (no database)
- Safe localStorage operations

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Required Features
- ES6+ JavaScript support
- CSS Grid and Flexbox
- LocalStorage API
- Modern DOM APIs

## Troubleshooting

### Common Issues

**Data Not Saving**
- Check if localStorage is enabled in your browser
- Ensure you're not in private/incognito mode
- Check browser storage quotas

**Charts Not Displaying**
- Ensure JavaScript is enabled
- Check for browser console errors
- Try refreshing the page

**Export Not Working**
- Check if downloads are blocked by your browser
- Ensure popup blockers aren't interfering
- Try a different browser

**Dark Mode Not Persisting**
- Check if cookies/localStorage are being cleared
- Ensure the site isn't in private browsing mode

### Performance Tips

- **Large Datasets**: The app handles thousands of entries efficiently
- **Regular Cleanup**: Delete old, unnecessary entries periodically
- **Browser Cache**: Clear cache if experiencing issues
- **Storage Limits**: Monitor localStorage usage in developer tools

## Contributing

This is a self-contained financial dashboard designed for personal use. If you'd like to extend functionality:

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines

- Follow existing code patterns
- Add proper TypeScript types
- Include error handling
- Test on multiple browsers
- Update documentation

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check this README for common solutions
2. Review browser console for error messages
3. Check browser compatibility
4. Consider data backup before troubleshooting

---

**Note**: This application runs entirely in your browser and requires no server setup. Your financial data never leaves your device, ensuring complete privacy and security.