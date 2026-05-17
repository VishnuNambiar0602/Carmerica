import { Router } from 'express';

const router = Router();

// Sample route
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from the API!' });
});

// Add more routes here

export default router;
