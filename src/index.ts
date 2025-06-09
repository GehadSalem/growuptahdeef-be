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

const allowedOrigins = ['https://growupe.com','https://www.growupe.com'];

const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
// // allowedOrigins.push('http://31.97.55.57');
// // CORS configuration
// import { CorsOptions } from 'cors';

// const corsOptions: CorsOptions = {
//   origin: (origin: string | undefined, callback) => {
//     console.log('Incoming origin:', origin);
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       console.log('Blocked by CORS:', origin);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
// };

// app.options('*', cors(corsOptions)); 
// app.use(cors());
// app.use(cors())
//   app.use(cors({
//     origin: "https://growupe.com", // Replace with your frontend domain
//     credentials: true // Allow cookies
//   }));
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

    const server = app.listen(port, () => {
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
