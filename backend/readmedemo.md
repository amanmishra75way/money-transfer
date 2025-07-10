# E-Commerce API

A robust backend API for e-commerce platforms built with Node.js, Express, and MongoDB. This API provides essential features including user authentication, product management, shopping cart functionality, order processing, and payment integration.

## Features

### Authentication & Authorization
- User registration and login system
- JWT-based authentication with access and refresh tokens
- Role-based access control (Admin/Customer)
- Secure password hashing using bcrypt

### Product Management
- CRUD operations for products
- Advanced product filtering and search
- Pagination and sorting capabilities
- Image upload support
- Category-based organization

### Shopping Cart
- Add/remove items to cart
- Update quantities
- Persistent cart storage
- Real-time stock validation

### Order Management
- Order creation and processing
- Order status tracking (Pending, Shipped, Delivered, Cancelled)
- Order history
- Admin order management capabilities

### Payment Processing
- Secure payment integration (Dummy implementation)
- Payment validation
- Transaction error handling

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- TypeScript
- JWT for authentication
- Multer for file uploads
- Express Validator for input validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- TypeScript

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ecommerce-api.git
cd ecommerce-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

4. Build the TypeScript code:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `POST /api/users/logout` - Logout user
- `GET /api/users/profile` - Get user profile

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add-to-cart` - Add item to cart
- `PUT /api/cart/update/:productId` - Update cart item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `DELETE /api/cart/clear-cart` - Clear entire cart

### Orders
- `POST /api/orders/create` - Create new order
- `GET /api/orders` - Get all user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/update-status/:id` - Update order status (Admin only)
- `GET /api/orders/status/:id` - Get order status

## Request & Response Examples

### Register User

Request:
```json
POST /api/users/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "CUSTOMER"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }
}
```

## Error Handling

The API uses standard HTTP response codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses follow this format:
```json
{
  "success": false,
  "message": "Error message here",
  "error_code": 400
}
```

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting for API endpoints
- Input validation and sanitization
- Role-based access control
- Secure HTTP headers

## Development

1. Run in development mode:
```bash
npm run dev
```

2. Run tests:
```bash
npm test
```

3. Lint code:
```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Aayush Sharma

## Acknowledgments

- Express.js documentation
- MongoDB documentation
- JWT.io
- TypeScript documentation