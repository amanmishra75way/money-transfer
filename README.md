# Money Transfer Application

## Project Description

This is a full-stack Money Transfer Application designed to facilitate secure and efficient money transfers between users. The backend is built with Node.js, Express, and TypeScript, while the frontend is developed using React, Material-UI (MUI), and Redux Toolkit. The application supports user authentication, transaction management, and provides dashboards for both users and administrators.

## Features

- User registration, login, and profile management
- Secure authentication and authorization
- Money transfer between users
- Deposit and withdrawal functionalities
- Transaction history and overview
- Admin dashboard for managing users and transactions
- Responsive and user-friendly interface

## Tech Stack

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- Passport.js for authentication
- JWT for token management
- ESLint and Prettier for code quality

### Frontend

- React
- Material-UI (MUI)
- Redux Toolkit
- React Router
- Vite as build tool

## Backend Setup and Run Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or pnpm

### Installation and Running

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend directory with necessary environment variables (e.g., database URI, JWT secrets).
4. To run the backend in development mode with hot reload:
   ```bash
   npm run local
   ```
5. To build the backend TypeScript code:
   ```bash
   npm run build
   ```
6. To start the backend server:
   ```bash
   npm start
   ```
7. Other useful scripts:
   - `npm run dev` - Build and run in development environment
   - `npm run prod` - Build and run in production environment
   - `npm run lint` - Run ESLint
   - `npm run format` - Format code with Prettier
   - `npm run generateDoc` - Generate API documentation using swagger.js

## Frontend Setup and Run Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation and Running

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. To start the frontend development server:
   ```bash
   npm run dev
   ```
4. To build the frontend for production:
   ```bash
   npm run build
   ```
5. To preview the production build:
   ```bash
   npm run preview
   ```
6. To run ESLint:
   ```bash
   npm run lint
   ```

## API Documentation

The backend API documentation can be generated using the following command in the backend directory:

```bash
npm run generateDoc
```

This will generate Swagger documentation based on the API routes.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature-name`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

Aayush Sharma

## Acknowledgments

- Node.js and Express.js documentation
- React and Material-UI documentation
- MongoDB and Mongoose documentation
- Passport.js and JWT documentation
- Inspiration from various open-source projects
