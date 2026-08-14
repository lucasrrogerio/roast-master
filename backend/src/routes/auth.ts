import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../db';
import { generateToken, authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { loginSchema } from '../middleware/schemas';

export const authRouter = Router();

authRouter.post('/login', validateBody(loginSchema), async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(401).json({ error: 'Credenciais inválidas' });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    res.status(401).json({ error: 'Credenciais inválidas' });
    return;
  }

  const token = generateToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as 'ADMIN' | 'ROAST_MASTER' | 'STOCKIST',
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

authRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  res.json({ user: req.user });
});
