import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});

// Serve static files from the React build directory
app.use(express.static(join(__dirname, 'dist')));

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  try {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Error loading the application');
  }
});

const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

// Wrap server startup in try-catch
try {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Server directory: ${__dirname}`);
    console.log(`Static files directory: ${join(__dirname, 'dist')}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
