// Internal server file for handling requests and serving static files

// Required modules
import express from 'express'; // Web server framework
import dotenv from 'dotenv'; // Load environment variables from .env file
import path from 'path'; // Handles file paths
import { fileURLToPath } from 'url'; // Convert URL to file path

// Loads dotenv variables into process.env
dotenv.config();

// Initialize Express app - handle routes and responses
const app = express();

// Define port to run server on
const port = process.env.PORT || 3000;

// Get absolute file path of current server.js file
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); // Get folder name of current file

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Route handler for GET requests to API key endpoints
app.get('/api-key', (req, res) => {
    res.json({ key: process.env.GOOGLE_MAPS_API_KEY });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Mode: ${process.env.NODE_ENV}`);
});
