# Apify Actor Management Platform

## Overview

This is a full-stack web application built for managing and executing Apify actors through a user-friendly interface. The application allows users to authenticate with their Apify API keys, browse their available actors, configure actor inputs through dynamic forms, and monitor execution results in real-time.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Integration**: Apify Client SDK for interacting with Apify platform
- **Session Management**: In-memory session storage for API key management
- **Data Storage**: Pluggable storage interface with in-memory implementation
- **Development**: Hot reload with Vite middleware integration

### Key Components

#### Authentication System
- API key-based authentication with Apify platform
- Session-based user management with temporary storage
- Automatic user creation for new Apify accounts
- Real-time API key validation

#### Actor Management
- Dynamic actor discovery from user's Apify account
- Actor metadata storage including schemas and run statistics
- Visual actor grid with categorized icons and colors
- Actor selection and preference management

#### Dynamic Form Generation
- JSON schema-based form generation for actor inputs
- Support for various input types (text, number, boolean, select, etc.)
- Real-time form validation with Zod schemas
- Custom form controls for complex data types

#### Execution Engine
- Asynchronous actor execution with run tracking
- Real-time status monitoring with automatic polling
- Progress indication and result visualization
- Error handling and retry mechanisms

## Data Flow

1. **Authentication Flow**:
   - User enters Apify API key
   - System validates key with Apify platform
   - Creates/retrieves user record
   - Establishes session with API key storage
   - Fetches and caches user's actors

2. **Actor Execution Flow**:
   - User selects actor from grid
   - System fetches actor's input schema
   - Dynamic form renders based on schema
   - User configures inputs and submits
   - System initiates execution via Apify API
   - Real-time polling for status updates
   - Results display upon completion

3. **Data Storage Flow**:
   - Users stored with username and metadata
   - Actors cached with selection preferences
   - Execution runs tracked with full lifecycle
   - Session data maintained in memory

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **apify-client**: Official Apify platform SDK
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **drizzle-kit**: Database schema management and migrations
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **vite**: Development server and build tool

### Database Schema
- **PostgreSQL** with Drizzle ORM
- Schema defined in `shared/schema.ts`
- Tables: users, apify_actors, execution_runs
- UUID primary keys with relationships
- JSONB fields for flexible data storage

## Deployment Strategy

### Development Environment
- Vite development server with hot reload
- Express server running on Node.js
- In-memory storage for rapid prototyping
- Environment variable configuration

### Production Build
- Vite builds optimized client bundle
- esbuild bundles server code
- Static assets served from Express
- Database migrations via Drizzle Kit

### Environment Requirements
- Node.js runtime environment
- PostgreSQL database instance
- Environment variables:
  - `DATABASE_URL`: PostgreSQL connection string
  - `NODE_ENV`: Environment setting

### Scalability Considerations
- Pluggable storage interface allows database switching
- Session management ready for Redis integration
- API rate limiting considerations for Apify calls
- Client-side caching reduces server load

The application follows a modern full-stack TypeScript architecture with emphasis on type safety, developer experience, and user interface quality. The modular design allows for easy extension and modification of core functionality.