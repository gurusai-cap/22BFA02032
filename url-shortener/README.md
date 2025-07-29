# URL Shortener Web Application

A modern React-based URL shortener application built with Material UI that allows users to shorten multiple URLs concurrently and view detailed analytics.

## Features

### Core Functionality
- **Multiple URL Shortening**: Shorten up to 5 URLs at once
- **Custom Short Codes**: Optionally provide custom short codes for URLs
- **Configurable Validity**: Set custom expiration times (default: 30 minutes)
- **Client-Side Routing**: Handle short URL redirections within the React app
- **Real-time Analytics**: Track clicks, sources, and locations

### User Experience
- **Modern UI**: Built with Material UI for a clean, professional look
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Copy to Clipboard**: One-click copying of shortened URLs
- **Auto-redirect**: Automatic redirection with manual override option
- **Error Handling**: Comprehensive error messages and validation

### Analytics & Statistics
- **Click Tracking**: Record every click with timestamp and source
- **Geographic Data**: Track click locations (simulated for demo)
- **Detailed Reports**: Expandable rows showing individual click details
- **Status Indicators**: Visual status showing active, expiring, or expired URLs

## Technical Requirements

- **React 18+** with TypeScript
- **Material UI** for styling
- **React Router** for navigation
- **Local Storage** for data persistence
- **Custom Logging Middleware** (no console.log usage)

## Installation & Setup

1. **Navigate to the project directory**:
   ```bash
   cd url-shortener
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Usage

### Shortening URLs

1. **Navigate to the home page** (URL Shortener tab)
2. **Add URLs**: Use the "Add Another URL" button to add up to 5 URLs
3. **Configure each URL**:
   - Enter the original URL (required)
   - Set validity period in minutes (optional, default: 30)
   - Provide custom short code (optional)
4. **Click "Shorten URLs"** to generate shortened links
5. **Copy URLs**: Click the copy icon next to each shortened URL

### Viewing Statistics

1. **Navigate to the Statistics tab**
2. **View all shortened URLs** in a comprehensive table
3. **Expand rows** to see detailed click analytics
4. **Refresh data** using the refresh button
5. **Copy URLs** directly from the statistics page

### Using Shortened URLs

1. **Click on any shortened URL** or navigate directly to `http://localhost:3000/{shortCode}`
2. **Wait for auto-redirect** (3 seconds) or click "Go Now"
3. **View redirect details** including the destination URL
4. **Return to home** automatically after redirection

## Project Structure

```
src/
├── components/
│   ├── UrlShortener.tsx      # Main URL shortening interface
│   ├── Statistics.tsx        # Analytics and statistics page
│   └── RedirectHandler.tsx   # Handles short URL redirections
├── services/
│   └── urlService.ts         # Business logic and data management
├── utils/
│   └── logger.ts             # Custom logging middleware
├── types/
│   └── index.ts              # TypeScript interfaces and types
├── App.tsx                   # Main application component
└── index.tsx                 # Application entry point
```

## Key Features Implementation

### Logging Middleware
- **Custom Logger**: Replaces all console.log usage
- **Persistent Storage**: Logs stored in localStorage
- **Component Tracking**: Each component logs its activities
- **Error Handling**: Comprehensive error logging

### URL Management
- **Unique Short Codes**: Ensures no duplicate short codes
- **Validation**: Client-side validation for all inputs
- **Expiration Handling**: Automatic cleanup of expired URLs
- **Data Persistence**: All data stored in localStorage

### Analytics
- **Click Recording**: Tracks timestamp, source, and location
- **Real-time Updates**: Statistics update immediately
- **Detailed Views**: Expandable rows for click details
- **Status Tracking**: Visual indicators for URL status

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Notes

### Logging
The application uses a custom logging middleware instead of console.log. All logs are stored in localStorage and can be accessed programmatically.

### Data Persistence
All shortened URLs and analytics are stored in localStorage. In a production environment, this would be replaced with a backend database.

### URL Validation
The application validates URLs using the built-in URL constructor and provides helpful error messages for invalid inputs.

### Error Handling
Comprehensive error handling is implemented throughout the application with user-friendly error messages and proper logging.

## Future Enhancements

- Backend API integration
- User authentication and accounts
- Advanced analytics and reporting
- QR code generation for shortened URLs
- Social media sharing integration
- API rate limiting and security features

## License

This project is created for educational and evaluation purposes.
