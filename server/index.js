import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

import { resolvers } from './resolvers.js'
import { typeDefs } from './schema.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  const start = Date.now()
  const timestamp = new Date().toISOString()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`)
  })
  
  next()
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers
})

async function startServer() {
  await server.start()
  
  app.use('/graphql', expressMiddleware(server))
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log(`GraphQL endpoint available at http://localhost:${PORT}/graphql`)
  })
}

startServer().catch(error => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
