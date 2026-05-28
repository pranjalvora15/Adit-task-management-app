import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRoutes from './routes/auth.routes'
import taskRoutes from './routes/task.routes'
import adminRoutes from './routes/admin.routes'
import { errorHandler } from './middleware/error.middleware'
import { setupSwagger } from './utils/swagger'

const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
)

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/admin', adminRoutes)

setupSwagger(app)

app.use(errorHandler)

export default app
