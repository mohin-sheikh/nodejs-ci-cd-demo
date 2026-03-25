import express, { Application, Request, Response, NextFunction } from 'express';
import { AppDataSource } from './config/database';
import { User } from './entities/User';
import { Product } from './entities/Product';
import path from 'path';
import { Order } from './entities/Order';

const app: Application = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: AppDataSource.isInitialized ? 'connected' : 'disconnected',
  });
});

// Welcome endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to Node.js TypeScript CI/CD Demo API' });
});

// User endpoints
app.get('/api/users', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

app.post('/api/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = userRepository.create(req.body);
    const result = await userRepository.save(user);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Product endpoints
app.get('/api/products', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const productRepository = AppDataSource.getRepository(Product);
    const products = await productRepository.find();
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

app.post('/api/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productRepository = AppDataSource.getRepository(Product);
    const product = productRepository.create(req.body);
    const result = await productRepository.save(product);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Order endpoints
app.get('/api/orders', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const orderRepository = AppDataSource.getRepository(Order);
    const orders = await orderRepository.find({
      relations: ['user', 'product'],
    });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

app.post('/api/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderRepository = AppDataSource.getRepository(Order);
    const order = orderRepository.create(req.body);
    const result = await orderRepository.save(order);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

export default app;
