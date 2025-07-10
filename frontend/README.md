# Money Transfer App

A full-fledged React application built with Vite, designed for managing money transfers with user and admin dashboards. This app demonstrates a structured approach to building web applications with authentication, transaction management, error handling, and state management using Redux.

## Features

- **User and Admin Dashboards:** Separate views tailored for different user roles.
- **Authentication:** Basic implementation for protecting routes and managing user sessions.
- **Money Transfers:** Users can transfer money to other users with commission calculations (domestic and international).
- **Deposit and Withdraw:** Users can request deposits and withdrawals, subject to admin approval.
- **Transaction History:** View detailed history of all transactions with status indicators.
- **Error Handling:** Robust error boundary components to catch and display errors gracefully.
- **State Management with Redux:** Centralized and predictable state management.
- **Routing:** Navigation between different pages using React Router.
- **Form Validation:** Uses React Hook Form and Yup for form validation.
- **Theming:** Basic theming setup with Material UI.
- **Responsive Design:** Mobile-friendly UI using Material UI's responsive utilities.
- **Fast Development:** Powered by Vite for fast build and hot module replacement.

## Technologies Used

- React
- Redux Toolkit
- React Router DOM
- Vite
- Material UI (MUI)
- React Hook Form
- Yup (for validation)
- JavaScript (ES6+)
- CSS (via index.css)
- Icons from Material UI Icons

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/amanmishra75way/money-transfer-app.git
   cd money-transfer-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL shown in the terminal (usually http://localhost:3000).

## Usage

- **Login:** Access the login page to authenticate.
- **User Dashboard:** After login, users can access their dashboard with the following tabs:
  - **Overview:** Summary of balance and recent transactions.
  - **Transfer:** Send money to other users with options for domestic or international transfers.
  - **Deposit:** Request to deposit money into your account.
  - **Withdraw:** Request to withdraw money from your account.
  - **History:** View all past transactions with status and details.
- **Logout:** Use the logout button to end your session.

## Folder Structure

```
money-transfer-app/
├── public/                 # Static assets and icons
├── src/
│   ├── Components/         # Reusable UI components
│   │   ├── adminComponents/
│   │   └── userComponents/ # Components specific to user dashboard tabs
│   ├── config/             # Route protection and app configuration
│   ├── layouts/            # Layout components for Admin and User dashboards
│   ├── pages/              # Page components (Login, Dashboards, Error pages)
│   ├── redux/              # Redux store and slices for user and transactions
│   ├── theme.jsx           # Material UI theme configuration
│   ├── App.jsx             # Main app component with routing
│   └── main.jsx            # Entry point
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## Contribution Guidelines

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with clear messages.
4. Push your branch and open a pull request describing your changes.

## Contact

For any questions or feedback, please contact Aman Mishra at amanmishra75way@gmail.com.
