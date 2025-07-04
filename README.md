# Docu-Signer - Document Signature Application

A full-featured document signature application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- **User Authentication**: JWT-based authentication with email verification
- **PDF Upload & Management**: Upload, view, and manage PDF documents
- **Document Signing**: Drag-and-drop signature placement on PDFs
- **External Signatures**: Send signature requests to others via email
- **Tokenized URLs**: Secure, time-limited links for external signers
- **Audit Trails**: Track all document and signature activities
- **Bulk Operations**: Delete multiple documents at once
- **Modern UI**: Beautiful interface built with Tailwind CSS

## External Signature Feature

### What is it?
- **Tokenized URL**: A secure, time-limited URL that allows someone to sign a document without creating an account
- **Email Integration**: Automatically send emails to signers with secure signing links
- **No Registration Required**: External signers can sign documents immediately via the link

### How it works:
1. User uploads a document and clicks "Request Signature"
2. System generates a unique, secure token and creates a signing URL
3. Email is sent to the signer with the secure link
4. Signer clicks the link and can sign the document without registration
5. Link expires after 7 days for security

## Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Docu-Signer
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd signature-app/server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**

   Create `.env` files in both server and client directories:

   **Server (.env)**
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLIENT_URL=http://localhost:3000
   
   # Email Configuration (Optional for development)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

   **Client (.env)**
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Email Setup (Optional)**

   For production email functionality:
   - Use Gmail with App Password
   - Or configure other email providers (SendGrid, AWS SES, etc.)
   - Without email config, the app will use mock emails for development

5. **Run the application**
   ```bash
   # Start the server (from server directory)
   cd signature-app/server
   npm start

   # Start the client (from client directory)
   cd signature-app/client
   npm start
   ```

## Usage

### For Document Owners:
1. Upload a PDF document
2. View the document and click "Request Signature"
3. Enter the signer's name and email
4. System sends an email with a secure signing link
5. Track signature requests in the "Signature Requests" section

### For External Signers:
1. Receive an email with a signing link
2. Click the link to access the document
3. Click anywhere on the document to place your signature
4. Enter your signature and submit
5. No account creation required!

## API Endpoints

### External Signatures
- `POST /api/external-signatures/create` - Create external signature request
- `GET /api/external-signatures/document/:token` - Get document for external signing
- `POST /api/external-signatures/sign/:token` - Submit external signature
- `GET /api/external-signatures/requests` - Get user's signature requests
- `POST /api/external-signatures/resend/:id` - Resend signature email

### Documents
- `GET /api/docs` - Get user's documents
- `POST /api/docs/upload` - Upload document
- `DELETE /api/docs/:id` - Delete document
- `DELETE /api/docs/bulk` - Bulk delete documents

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email

## Security Features

- JWT-based authentication
- Email verification for new accounts
- Time-limited signature tokens (7 days)
- Secure file upload handling
- Audit trail for all activities

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React.js, Tailwind CSS, React Router
- **PDF Handling**: react-pdf, PDF.js
- **Email**: Nodemailer
- **Authentication**: JWT
- **File Upload**: Multer

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 