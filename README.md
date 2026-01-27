# Alamia Connect KTD - CRM UI

A modern Customer Relationship Management (CRM) user interface built with **Next.js 14**, **React**, **TypeScript**, and **Tailwind CSS**. This application provides a comprehensive dashboard for managing sales, customers, inventory, HR operations, and more.

## Project Overview

Alamia Connect KTD is an enterprise-grade CRM solution designed to streamline business operations across multiple departments. It features a clean, intuitive interface with role-based access control, real-time data management, and comprehensive reporting capabilities.

## Key Features

### Sales Management
- Sales dashboard with performance metrics
- Sales performance tracking and analytics
- Lead management system
- Commission tracking and recovery

### Customer Management
- Customer database with searchable tables
- Customer profile management
- Customer interaction history

### Inventory Management
- Inventory dashboard with stock levels
- Product tracking
- Inventory reports and analytics

### Field Operations
- Field visit logging and tracking
- Sales activity hub
- Real-time location and activity monitoring

### HR & Payroll
- Attendance tracking
- Payroll management
- Reimbursement processing
- HR dashboard with employee metrics

### Service & Maintenance
- Service installation tracking
- Maintenance scheduling and logging
- Preventive maintenance management
- Service provider management

### Additional Features
- Import/export data tracking
- User profile and settings management
- Role-based authentication
- Responsive design for mobile and desktop

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Components**: Shadcn/ui component library

## Project Structure

```
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── login/                   # Authentication pages
│   ├── dashboard/               # Main dashboard
│   ├── sales/                   # Sales module
│   ├── customers/               # Customer management
│   ├── inventory/               # Inventory management
│   ├── hr/                      # HR & payroll
│   ├── field-visits/            # Field operations
│   ├── service-installation/    # Service management
│   ├── maintenance/             # Maintenance management
│   ├── commissions/             # Commission tracking
│   ├── imports/                 # Data imports
│   ├── profile/                 # User profile
│   └── leads/                   # Lead management
│
├── components/                  # Reusable React components
│   ├── ui/                      # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── ...more UI components
│   ├── dashboard-layout.tsx     # Main layout wrapper
│   ├── auth-wrapper.tsx         # Authentication context
│   ├── theme-provider.tsx       # Theme configuration
│   └── [module]/                # Module-specific components
│       ├── sales-dashboard.tsx
│       ├── customers-table.tsx
│       ├── hr-dashboard.tsx
│       └── ...more
│
├── lib/                         # Utility functions
│   └── utils.ts                 # Helper functions
│
├── public/                      # Static assets
├── styles/                      # Global styles
└── config files                 # TypeScript, Next.js, Tailwind config
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AlamiaConnectKTD-nextjs
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Dependencies

- **next**: Modern React framework with App Router
- **react**: UI library
- **typescript**: Type safety
- **tailwindcss**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **postcss**: CSS processing

## UI Components

The project uses Shadcn/ui components for a consistent, accessible design system:
- Buttons, Cards, Dialogs, Drawers
- Tables, Forms, Inputs, Selects
- Tabs, Badges, Avatars, Alerts
- Progress indicators, Separators, Switches
- And more...

## Authentication

The application includes authentication wrappers and profile management:
- User login/logout functionality
- Role-based access control
- Profile settings management
- Secure session handling

## Responsive Design

The UI is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile devices

## Development Notes

- Uses TypeScript for type safety
- Organized component structure by feature/module
- Reusable UI components in the `ui/` directory
- Tailwind CSS for consistent styling

## Configuration Files

- **next.config.mjs**: Next.js configuration
- **tsconfig.json**: TypeScript configuration
- **tailwind.config.js**: Tailwind CSS customization
- **postcss.config.mjs**: PostCSS configuration
- **components.json**: Component library settings

## Contributing

Guidelines for contributing to this project should follow the established code structure and component patterns.

## License

[Add your license information here]

---

**Alamia Connect KTD** - Enterprise CRM Solution for Modern Business Management
