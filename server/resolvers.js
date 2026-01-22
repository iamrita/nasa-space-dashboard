import dotenv from 'dotenv'

dotenv.config()

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
        const data = await response.json()
        return {
          title: data.title,
          explanation: data.explanation,
          url: data.url,
          hdurl: data.hdurl || null,
          date: data.date,
          media_type: data.media_type,
          copyright: data.copyright || null
        }
      } catch (error) {
        throw new Error(`Failed to fetch APOD: ${error.message}`)
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
        
        const items = (data.collection?.items || []).map(item => {
          const itemData = item.data?.[0] || {}
          const links = item.links || []
          const thumbnail = links.find(link => link.rel === 'preview')?.href || links[0]?.href || ''
          
          return {
            nasa_id: itemData.nasa_id || '',
            title: itemData.title || '',
            description: itemData.description || null,
            date_created: itemData.date_created || null,
            media_type: itemData.media_type || mediaType,
            thumbnail: thumbnail,
            center: itemData.center || null,
            keywords: itemData.keywords || []
          }
        })

        return {
          items,
          total_hits: data.collection?.metadata?.total_hits || 0
        }
      } catch (error) {
        throw new Error(`Failed to search images: ${error.message}`)
      }
    },

    nearEarthObjects: async (_, { startDate, endDate }) => {
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
        
        // Transform the nested structure into a flat array
        const neos = []
        const nearEarthObjects = data.near_earth_objects || {}
        
        for (const [date, objects] of Object.entries(nearEarthObjects)) {
          for (const neo of objects) {
            const approach = neo.close_approach_data?.[0] || {}
            neos.push({
              id: neo.id || '',
              name: neo.name || '',
              absolute_magnitude_h: neo.absolute_magnitude_h || null,
              is_potentially_hazardous: neo.is_potentially_hazardous_asteroid || false,
              close_approach_date: approach.close_approach_date || date,
              miss_distance_km: approach.miss_distance?.kilometers || null,
              relative_velocity_kmh: approach.relative_velocity?.kilometers_per_hour || null,
              estimated_diameter_min_m: neo.estimated_diameter?.meters?.estimated_diameter_min || null,
              estimated_diameter_max_m: neo.estimated_diameter?.meters?.estimated_diameter_max || null,
              orbiting_body: approach.orbiting_body || null,
              nasa_jpl_url: neo.nasa_jpl_url || null
            })
          }
        }
        
        return neos
      } catch (error) {
        throw new Error(`Failed to fetch NEOs: ${error.message}`)
      }
    }
  }
}
