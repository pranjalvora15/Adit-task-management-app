import 'dotenv/config'
import { connectDB } from './config/db'
import app from './app'

const PORT = process.env.PORT || 5000

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)
      console.log(`Swagger docs available at http://localhost:${PORT}/api/docs`)
    })
  })
  .catch((err: Error) => {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })
