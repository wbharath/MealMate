# MealMate Project

MealMate is a web application for booking meal plans. Follow the instructions below to run the project locally on your machine.

## Prerequisites

- **Node.js and npm:**  
  Download and install from [nodejs.org](https://nodejs.org/).
- **MongoDB:**  
  Install and run MongoDB locally, or use a cloud-based service like MongoDB Atlas.

## Installation

### 1. Clone the Repository
git clone https://github.com/yourusername/your-repository-name.git

### 2. Navigate to the Project Directory
cd your-repository-name

### 3. Install Dependencies
cd backend
npm install

### 4. Configure the Database Connection
mongoose.connect('mongodb://localhost:27017/mealMateDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

### 5. Start the Backend Server
From the backend directory, run:
node server.js

### 6.You should see output similar to:
MongoDB connected
Server running on port 3000

### 7. Serve the Frontend


