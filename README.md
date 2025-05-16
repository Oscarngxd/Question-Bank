# Question Bank System

A web application for teachers to manage and organize their question bank. Teachers can add questions, categorize them by type, level, and topic, and export selected questions for creating exam papers.

## Features

- Add questions with different types (MC, LQ, SQ)
- Categorize questions by difficulty level and topic
- Filter questions based on type, level, and topic
- Select and export questions for exam papers
- Modern and intuitive user interface

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd question-bank
```

2. Install server dependencies
```bash
npm install
```

3. Install client dependencies
```bash
cd client
npm install
cd ..
```

4. Create a `.env` file in the root directory with the following content:
```
PORT=5000
MONGODB_URI=mongodb://localhost/question-bank
```

## Running the Application

1. Start MongoDB service on your machine

2. Start the server (from the root directory)
```bash
npm start
```

3. Start the client (in a new terminal)
```bash
cd client
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Adding Questions:
   - Click on "Add Question" in the navigation bar
   - Fill in the question details
   - For MC questions, add options and select the correct answer
   - Click "Add Question" to save

2. Viewing and Filtering Questions:
   - Go to the Question List page
   - Use the filters at the top to filter by type, level, and topic
   - View all questions in a card format

3. Exporting Questions:
   - Select questions using the checkboxes
   - Click "Export Selected Questions" to download

## Technologies Used

- Frontend:
  - React
  - Material-UI
  - React Router

- Backend:
  - Node.js
  - Express
  - MongoDB
  - Mongoose

## License

MIT 