import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import User from '../models/User'

const isProd = process.env.NODE_ENV === 'production'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'strict') as 'none' | 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET!
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign({ id: userId }, secret, { expiresIn } as jwt.SignOptions)
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array().map((e) => e.msg).join('; ') })
      return
    }

    const { name, email, password } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      res.status(400).json({ message: 'Email already in use' })
      return
    }

    const user = await User.create({ name, email, password })
    const token = signToken(user._id.toString())

    res.cookie('token', token, COOKIE_OPTIONS)
    res.status(201).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array().map((e) => e.msg).join('; ') })
      return
    }

    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid email or password' })
      return
    }

    const token = signToken(user._id.toString())
    res.cookie('token', token, COOKIE_OPTIONS)
    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const u = req.user!
  res.json({
    user: {
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
    },
  })
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
  })
  res.json({ message: 'Logged out successfully' })
}
