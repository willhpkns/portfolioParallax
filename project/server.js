import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting server...');
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);

const app = express();

// Keep the process alive
const keepAlive = () => {
    console.log('Server keep-alive ping');
    setTimeout(keepAlive, 10000);
};

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
});

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Serve static files from the React build directory
const staticPath = join(__dirname, 'dist');
console.log('Static files path:', staticPath);
app.use(express.static(staticPath));

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
    const indexPath = join(__dirname, 'dist', 'index.html');
    console.log('Serving index.html from:', indexPath);
    try {
        res.sendFile(indexPath);
    } catch (error) {
        console.error('Error serving index.html:', error);
        res.status(500).send('Error loading the application');
    }
});

const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

// Handle process events
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Wrap server startup in try-catch
try {
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
        console.log('Server address:', server.address());
        // Start the keep-alive mechanism
        keepAlive();
    });

    server.on('error', (error) => {
        console.error('Server error:', error);
    });
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}
