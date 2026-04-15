# Tuimizane Frontend

A modern React frontend application for the Tuimizane ROSCA (Rotating Savings and Credit Association) Payment System.

## Overview

This frontend application provides a comprehensive interface for managing ROSCA operations including member management, season creation, payment processing, and contribution tracking. It's built with modern web technologies and follows best practices for scalability and maintainability.

## Tech Stack

- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query for server state, React hooks for local state
- **HTTP Client**: Axios with interceptors
- **UI Components**: Custom components with Headless UI primitives
- **Icons**: Heroicons & Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Charts**: Recharts for analytics

## Features

### Authentication & Authorization
- JWT-based authentication
- Token management with auto-refresh
- Protected routes
- Role-based access control

### Member Management
- Create, update, delete members
- Bulk member upload via Excel files
- Member search and filtering
- Card assignment/management
- Member contribution history

### Season Management
- Create seasons with automatic member ranking
- Add/remove members from seasons
- Set top 3 priority members
- Recalculate rankings
- Season lifecycle management (active, ended)

### Payment Processing
- Weekly payment processing
- Payment scheduling
- Payment history tracking
- Circle completion detection
- Multiple payment methods support

### Contribution Tracking
- Daily contribution recording
- Contribution approval workflow
- Contribution analytics and reporting
- Export functionality

### Dashboard & Analytics
- Real-time statistics
- Season progress tracking
- Financial overview
- Performance metrics

## Project Structure

```
frontend/
src/
  components/          # Reusable UI components
    ui/               # Base UI components (Button, Input, Modal, etc.)
    seasons/          # Season-specific components
    members/          # Member-specific components
    payments/         # Payment-specific components
  pages/              # Next.js pages
    dashboard.tsx     # Main dashboard
    login.tsx         # Login page
    _app.tsx          # App wrapper
  services/           # API service layer
    auth.service.ts   # Authentication service
    season.service.ts # Season management service
    payment.service.ts # Payment service
    member.service.ts # Member management service
    contribution.service.ts # Contribution service
    organization.service.ts # Organization service
  hooks/              # Custom React hooks
    useAuth.ts        # Authentication hook
    useSeasons.ts     # Seasons hook
    usePayments.ts    # Payments hook
    useMembers.ts     # Members hook
  types/              # TypeScript type definitions
    api.ts            # API contract types
  utils/              # Utility functions
    format.ts         # Date/currency formatting
    validation.ts     # Form validation
    constants.ts      # Application constants
  lib/                # Library files
    api-client.ts     # HTTP client configuration
  styles/             # Global styles
    globals.css       # Tailwind CSS + custom styles
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on localhost:8080 (or configured URL)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tuimizane/frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=Tuimizane
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_DEV_MODE=true
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## API Integration

The frontend is designed to work with the Spring Boot backend API. All API calls are handled through the service layer in the `src/services/` directory.

### Authentication Flow

1. User logs in via `/api/auth/login`
2. JWT token is stored in localStorage
3. Token is automatically included in all subsequent API calls
4. Token refresh and logout handled automatically

### Error Handling

- Global error interceptors handle common HTTP errors
- 401 responses automatically redirect to login
- User-friendly error messages displayed via toast notifications
- Form validation errors shown inline

## Key Components

### API Client (`src/lib/api-client.ts`)

- Axios instance with interceptors
- Automatic token management
- Error handling and retry logic
- File upload support with progress tracking

### Custom Hooks (`src/hooks/`)

- `useAuth`: Authentication state and actions
- `useSeasons`: Season management operations
- `usePayments`: Payment processing and status
- `useMembers`: Member CRUD operations

### Type Safety (`src/types/api.ts`)

- Complete TypeScript definitions for all API contracts
- Request/response interfaces
- Error types and utility types

## Styling

The application uses Tailwind CSS with custom utility classes:

- Component-based styling approach
- Responsive design with mobile-first approach
- Custom color palette for consistent branding
- Animation utilities for smooth transitions

## State Management

- **Server State**: React Query for caching and synchronization
- **Client State**: React hooks and local state
- **Form State**: React Hook Form for form validation
- **Global State**: Context API for authentication

## Testing

The project is set up for testing with:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Deployment

### Environment Variables

Ensure these are set in your production environment:

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_VERSION`: Application version

### Build Process

1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Deploy to your preferred hosting platform

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing component patterns
- Use semantic HTML elements
- Implement proper error boundaries
- Write meaningful commit messages

### Component Development

- Keep components small and focused
- Use proper TypeScript props
- Implement loading states
- Handle edge cases gracefully
- Add proper accessibility attributes

### API Integration

- Use the provided service layer
- Handle loading and error states
- Implement optimistic updates where appropriate
- Cache data appropriately with React Query

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For questions or issues:

1. Check the existing documentation
2. Review the API documentation in the backend
3. Create an issue in the repository

## License

This project is licensed under the MIT License.
# tuimizane-web-v2
