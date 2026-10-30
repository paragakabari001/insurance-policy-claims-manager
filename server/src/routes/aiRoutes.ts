import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { processAIChat } from '../services/aiService';

const router = Router();

// POST /api/ai/chat - Authenticated AI Policy & Claims Assistant
router.post('/chat', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Authentication required to access the AI assistant.' });
      return;
    }

    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'A valid text message is required.' });
      return;
    }

    if (message.length > 2000) {
      res.status(400).json({ error: 'Message exceeds the maximum length of 2,000 characters.' });
      return;
    }

    const result = await processAIChat({
      userId: user.id,
      userRole: user.role,
      userName: user.name,
      message,
      history: Array.isArray(history) ? history : [],
    });

    res.json(result);
  } catch (err: any) {
    console.error('Error handling AI chat request:', err);
    res.status(500).json({
      error: 'An unexpected error occurred while communicating with the AI Assistant.',
    });
  }
});

export default router;
