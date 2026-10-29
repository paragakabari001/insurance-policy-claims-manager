import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { requireAdmin } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

// GET /api/customers (Admin only)
router.get('/', ...requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'Customer' },
      select: {
        id: true,
        username: true,
        name: true,
        createdAt: true,
      },
      orderBy: { username: 'asc' },
    });

    res.json({ customers });
  } catch (err: any) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Failed to retrieve customers.' });
  }
});

export default router;
