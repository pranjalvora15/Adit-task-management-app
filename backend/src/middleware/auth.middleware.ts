import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

interface JwtPayload {
  id: string
}

export async function protect(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token: string | undefined = req.cookies?.token

  if (!token) {
    res.status(401).json({ message: 'Not authenticated — no token provided' })
    return
  }

  try {
    const secret = process.env.JWT_SECRET!
    const decoded = jwt.verify(token, secret) as JwtPayload

    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      res.status(401).json({ message: 'User belonging to this token no longer exists' })
      return
    }

    req.user = user
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
