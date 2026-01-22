import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import http from 'http'
import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { typeDefs } from './schema.js'
import { resolvers } from './resolvers.js'

dotenv.config()

const app = express()
const httpServer = http.createServer(app)
const PORT = process.env.PORT || 3002

app.use(cors())
app.use(express.json())

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now()
  const timestamp = new Date().toISOString()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`)
  })
  
  next()
})

// Create Apollo Server instance
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  formatError: (error) => {
    console.error('GraphQL Error:', error.message)
    return error
  }
})

// Start Apollo Server and apply middleware
async function startServer() {
  await apolloServer.start()
  
  // GraphQL endpoint - handle the request manually
  app.post('/graphql', async (req, res) => {
    try {
      const { query, variables, operationName } = req.body
      const result = await apolloServer.executeOperation({
        query,
        variables,
        operationName
      })
      
      if (result.body.kind === 'single') {
        res.json(result.body.singleResult)
      } else {
        res.json({ errors: [{ message: 'Unexpected response type' }] })
      }
    } catch (error) {
      console.error('GraphQL execution error:', error)
      res.status(500).json({ errors: [{ message: error.message }] })
    }
  })
  
  // Health check endpoint (keep as REST for simple health checks)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })
  
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`)
  })
}

startServer().catch(console.error)
