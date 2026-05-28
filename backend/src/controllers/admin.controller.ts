import { Request, Response, NextFunction } from 'express'
import User from '../models/User'
import Task from '../models/Task'

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 })
    res.json({ users, total: users.length })
  } catch (err) {
    next(err)
  }
}

export async function listAllTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const skip = (page - 1) * limit

    const filter: Record<string, unknown> = {}

    const userId = req.query.userId as string
    if (userId) filter.userId = userId

    const status = req.query.status as string
    if (status && status !== 'all') filter.status = status

    const priority = req.query.priority as string
    if (priority && priority !== 'all') filter.priority = priority

    const search = req.query.search as string
    if (search?.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ]
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ])

    res.json({ tasks, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    next(err)
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params

    if (id === req.user!._id.toString()) {
      res.status(400).json({ message: 'Cannot delete your own account' })
      return
    }

    const user = await User.findById(id)
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    await Task.deleteMany({ userId: id })
    await User.findByIdAndDelete(id)

    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function deleteAdminTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params

    const task = await Task.findByIdAndDelete(id)
    if (!task) {
      res.status(404).json({ message: 'Task not found' })
      return
    }

    await Task.updateMany(
      { userId: task.userId, order: { $gt: task.order } },
      { $inc: { order: -1 } }
    )

    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
