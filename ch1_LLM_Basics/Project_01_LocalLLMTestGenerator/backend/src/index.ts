import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateRoutes from './routes/generate';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/generate', generateRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Local LLM Test Generator API is running.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
