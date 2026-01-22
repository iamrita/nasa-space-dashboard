const NASA_API_KEY = process.env.NASA_API_KEY
const NASA_BASE_URL = 'https://api.nasa.gov'
const NASA_IMAGES_URL = 'https://images-api.nasa.gov'

export const resolvers = {
  Query: {
    apod: async () => {
      try {
        const response = await fetch(`${NASA_BASE_URL}/planetary/apod?api_key=${NASA_API_KEY}`)
        if (!response.ok) {
          throw new Error(`NASA API error: ${response.status}`)
        }
        return await response.json()
      } catch (error) {
        console.error('APOD error:', error.message)
        throw error
      }
    },

    searchImages: async (_, { query = 'galaxy', mediaType = 'image', page = 1 }) => {
      try {
        const url = `${NASA_IMAGES_URL}/search?q=${encodeURIComponent(query)}&media_type=${mediaType}&page=${page}`
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`NASA Images API error: ${response.status}`)
        }
        const data = await response.json()
        
        // Transform the data to match our GraphQL schema
        const items = data.collection?.items || []
        const transformedItems = items
          .filter(item => item.links && item.links[0]?.href)
          .map(item => ({
            id: item.data[0]?.nasa_id,
            title: item.data[0]?.title,
            description: item.data[0]?.description,
            date: item.data[0]?.date_created,
            center: item.data[0]?.center,
            keywords: item.data[0]?.keywords || [],
            thumbnail: item.links[0]?.href,
            detailsHref: item.href
          }))

        return {
          collection: {
            items: transformedItems,
            metadata: {
              total_hits: data.collection?.metadata?.total_hits || 0
            }
          }
        }
      } catch (error) {
        console.error('Image search error:', error.message)
        throw error
      }
    },

    neo: async (_, { startDate, endDate }) => {
      try {
        const today = new Date()
        const start = startDate || today.toISOString().split('T')[0]
        const end = endDate || new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        
        const url = `${NASA_BASE_URL}/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${NASA_API_KEY}`
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`NASA NEO API error: ${response.status}`)
        }
        const data = await response.json()
        
        // Transform the near_earth_objects from an object to an array for GraphQL
        const nearEarthObjectsArray = Object.entries(data.near_earth_objects)
          .sort(([a], [b]) => new Date(a) - new Date(b))
          .map(([date, objects]) => ({
            date,
            objects
          }))

        return {
          element_count: data.element_count,
          near_earth_objects: nearEarthObjectsArray
        }
      } catch (error) {
        console.error('NEO error:', error.message)
        throw error
      }
    },

    health: () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString()
      }
    }
  }
}
