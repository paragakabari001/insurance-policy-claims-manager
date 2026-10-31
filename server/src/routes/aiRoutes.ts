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
      userUsername: user.username,
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

// POST /api/ai/chat/stream - Server-Sent Events streaming variant (typing effect)
router.post('/chat/stream', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  const send = (obj: unknown) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  try {
    let emitted = false;
    const result = await processAIChat({
      userId: user.id,
      userRole: user.role,
      userName: user.name,
      userUsername: user.username,
      message,
      history: Array.isArray(history) ? history : [],
      onToken: (token) => {
        emitted = true;
        send({ token });
      },
    });

    if (!emitted) {
      // Fallback / offline replies: pace them in small chunks so the UI still types out
      const words = result.reply.split(/(\s+)/);
      for (let i = 0; i < words.length; i += 3) {
        send({ token: words.slice(i, i + 3).join('') });
        await new Promise((r) => setTimeout(r, 18));
      }
    }
    send({ done: true, suggestedQuestions: result.suggestedQuestions });
  } catch (err) {
    console.error('Error handling AI stream request:', err);
    send({ error: 'An unexpected error occurred while communicating with the AI Assistant.' });
  } finally {
    res.end();
  }
});

export default router;
