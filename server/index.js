import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002
const NASA_API_KEY = process.env.NASA_API_KEY
const NASA_BASE_URL = 'https://api.nasa.gov'
const NASA_IMAGES_URL = 'https://images-api.nasa.gov'

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

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NASA Space Dashboard API',
      version: '1.0.0',
      description: 'Proxy API for NASA Open APIs'
    },
    servers: [{ url: `http://localhost:${PORT}` }]
  },
  apis: ['./index.js']
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

/**
 * @openapi
 * /api/apod:
 *   get:
 *     summary: Get Astronomy Picture of the Day
 *     tags: [APOD]
 *     responses:
 *       200:
 *         description: APOD data
 */
app.get('/api/apod', async (req, res) => {
  try {
    const response = await fetch(`${NASA_BASE_URL}/planetary/apod?api_key=${NASA_API_KEY}`)
    if (!response.ok) {
      throw new Error(`NASA API error: ${response.status}`)
    }
    const data = await response.json()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @openapi
 * /api/images/search:
 *   get:
 *     summary: Search NASA Image and Video Library
 *     tags: [Images]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: media_type
 *         schema:
 *           type: string
 *           enum: [image, video, audio]
 *         description: Media type filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Search results
 */
app.get('/api/images/search', async (req, res) => {
  try {
    const { q = 'galaxy', media_type = 'image', page = 1 } = req.query
    const url = `${NASA_IMAGES_URL}/search?q=${encodeURIComponent(q)}&media_type=${media_type}&page=${page}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`NASA Images API error: ${response.status}`)
    }
    const data = await response.json()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @openapi
 * /api/neo:
 *   get:
 *     summary: Get Near Earth Objects
 *     tags: [NEO]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: NEO data
 */
app.get('/api/neo', async (req, res) => {
  try {
    const today = new Date()
    const startDate = req.query.start_date || today.toISOString().split('T')[0]
    const endDate = req.query.end_date || new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const url = `${NASA_BASE_URL}/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`NASA NEO API error: ${response.status}`)
    }
    const data = await response.json()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`API docs available at http://localhost:${PORT}/api-docs`)
})
