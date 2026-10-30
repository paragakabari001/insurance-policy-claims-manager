import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import policyRoutes from './routes/policyRoutes';
import claimRoutes from './routes/claimRoutes';
import customerRoutes from './routes/customerRoutes';
import aiRoutes from './routes/aiRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// API health endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'insurance-policy-claims-manager',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/ai', aiRoutes);

// Serve static frontend in production
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req: Request, res: Response, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('Insurance Policy & Claims Management API is running. Build frontend to access UI.');
    }
  });
});

export default app;
