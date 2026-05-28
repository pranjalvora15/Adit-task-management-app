import { Router } from 'express'
import { listUsers, listAllTasks, deleteUser, deleteAdminTask } from '../controllers/admin.controller'
import { protect } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'

const router = Router()

router.use(protect, requireRole('admin'))

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints (require admin role)
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all registered users (admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Array of all users
 *       403:
 *         description: Admin role required
 */
router.get('/users', listUsers)

/**
 * @swagger
 * /api/admin/tasks:
 *   get:
 *     summary: List all tasks across all users (admin only)
 *     tags: [Admin]
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
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [all, pending, completed] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [all, low, medium, high] }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: Filter tasks for a specific user (drill-down)
 *     responses:
 *       200:
 *         description: Paginated task list with populated user info
 *       403:
 *         description: Admin role required
 */
router.get('/tasks', listAllTasks)

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user and cascade-delete their tasks (admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: User and their tasks deleted
 *       400:
 *         description: Cannot delete your own account
 *       403:
 *         description: Admin role required
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', deleteUser)

/**
 * @swagger
 * /api/admin/tasks/{id}:
 *   delete:
 *     summary: Delete any task as admin (regardless of owner)
 *     tags: [Admin]
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
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Task not found
 */
router.delete('/tasks/:id', deleteAdminTask)

export default router
