import { Router } from 'express'
import { body } from 'express-validator'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  patchStatus,
} from '../controllers/task.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

router.use(protect)

const validateCreate = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('dueDate').notEmpty().withMessage('Due date is required'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
]

const validateUpdate = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be pending or completed'),
]

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task CRUD operations (all routes require authentication)
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for the authenticated user
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search in title and description
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [all, pending, completed] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [all, low, medium, high] }
 *     responses:
 *       200:
 *         description: Paginated task list
 */
router.get('/', getTasks)

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, dueDate]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 example: "2025-12-31"
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Validation error
 */
router.post('/', validateCreate, createTask)

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, completed]
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Task updated
 *       404:
 *         description: Task not found
 */
router.put('/:id', validateUpdate, updateTask)

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
router.delete('/:id', deleteTask)

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: Toggle task status between pending and completed
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task with toggled status
 *       404:
 *         description: Task not found
 */
router.patch('/:id/status', patchStatus)

export default router
