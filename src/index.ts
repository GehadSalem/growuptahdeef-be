import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { publicRouter, protectedRouter } from './routes/index';
import { AppDataSource } from './dbConfig/data-source';
import { authenticate } from './middlewares/auth.middleware';
import { globalErrorHandling } from './middlewares/error.middleware';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
// allowedOrigins.push('http://31.97.55.57');
// CORS configuration
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// DB connection
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connected');

    app.get('/', (req, res) => {
      res.send('تطبيق منظم الحياة الشخصية - API');
    });

    // Public routes
    app.use('/api/auth', publicRouter);

    // Protected routes
    app.use('/api', (req, res, next) => {
      Promise.resolve(authenticate(req, res, next)).catch(next);
    }, protectedRouter);

    // Error handler
    app.use(globalErrorHandling);

    const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
    server.on('error', (error) => {
      console.error('Server error:', error);
    });
  })
  .catch((error: Error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

// Error safety
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
