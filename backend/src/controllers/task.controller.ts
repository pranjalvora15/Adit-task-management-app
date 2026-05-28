import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import Task from '../models/Task'

export async function getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id

    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const skip = (page - 1) * limit

    const filter: Record<string, unknown> = { userId }

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
      Task.find(filter).sort({ order: 1 }).skip(skip).limit(limit),
      Task.countDocuments(filter),
    ])

    res.json({
      tasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    next(err)
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array().map((e) => e.msg).join('; ') })
      return
    }

    const userId = req.user!._id

    const lastTask = await Task.findOne({ userId }).sort({ order: -1 })
    const order = lastTask ? lastTask.order + 1 : 0

    const { title, description, priority, dueDate } = req.body
    const task = await Task.create({ title, description, priority, dueDate, userId, order })

    res.status(201).json(task)
  } catch (err) {
    next(err)
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array().map((e) => e.msg).join('; ') })
      return
    }

    const userId = req.user!._id
    const { id } = req.params

    const { title, description, priority, dueDate, status, order } = req.body
    const updates: Record<string, unknown> = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (priority !== undefined) updates.priority = priority
    if (dueDate !== undefined) updates.dueDate = dueDate
    if (status !== undefined) updates.status = status
    if (order !== undefined) updates.order = order

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!task) {
      res.status(404).json({ message: 'Task not found' })
      return
    }

    res.json(task)
  } catch (err) {
    next(err)
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id
    const { id } = req.params

    const task = await Task.findOneAndDelete({ _id: id, userId })
    if (!task) {
      res.status(404).json({ message: 'Task not found' })
      return
    }

    await Task.updateMany(
      { userId, order: { $gt: task.order } },
      { $inc: { order: -1 } }
    )

    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function patchStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id
    const { id } = req.params

    const task = await Task.findOne({ _id: id, userId })
    if (!task) {
      res.status(404).json({ message: 'Task not found' })
      return
    }

    task.status = task.status === 'pending' ? 'completed' : 'pending'
    await task.save()

    res.json(task)
  } catch (err) {
    next(err)
  }
}
