# LegalFlow - Practice Management System

LegalFlow is a modern, comprehensive Legal Practice Management System built with React, TypeScript, Tailwind CSS, and a Node.js/MongoDB backend.

## 🚀 Features

- **Authentication System**: Secure JWT-based login and registration.
- **Dashboard**: Real-time overview of active cases, client stats, and revenue metrics.
- **Client Management**: Directory of clients with status tracking.
- **Case Management**: Complete case tracking with priority levels.
- **Backend**: Express server with MongoDB database.

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (Running locally or a cloud URI)

### Installation & Setup

1.  **Clone the repository** (or download the files):
    ```bash
    git clone <repository-url>
    cd legalflow
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env.local` file in the root directory and add your MongoDB connection string and a secret key:

    ```
    MONGODB_URI=mongodb://localhost:27017/legalflow
    JWT_SECRET=your_super_secret_key_here
    PORT=5000
    ```

4.  **Run the Application**:
    This command runs both the backend server and the frontend development server concurrently:
    ```bash
    npm run dev
    ```

5.  **Open the application**:
    Navigate to `http://localhost:5173` in your browser.

## 📂 Project Structure

- `server/`: Backend code (Express app, Models, Routes)
- `pages/`: Application views
- `components/`: Reusable UI components
- `context/`: React Context providers
- `services/`: API interaction logic

## 📝 Notes

If you are running MongoDB locally, ensure the service is active (`mongod`). If using MongoDB Atlas, ensure your `MONGODB_URI` includes the correct credentials.
