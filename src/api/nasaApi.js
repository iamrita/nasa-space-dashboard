import { gql } from '@apollo/client'
import { client } from '../apolloClient'

const GET_APOD = gql`
  query GetAPOD {
    apod {
      title
      explanation
      url
      hdurl
      date
      media_type
      copyright
    }
  }
`

const SEARCH_IMAGES = gql`
  query SearchImages($query: String, $mediaType: String, $page: Int) {
    searchImages(query: $query, mediaType: $mediaType, page: $page) {
      items {
        nasa_id
        title
        description
        date_created
        media_type
        thumbnail
        center
        keywords
      }
      total_hits
    }
  }
`

const GET_NEOS = gql`
  query GetNEOs($startDate: String, $endDate: String) {
    nearEarthObjects(startDate: $startDate, endDate: $endDate) {
      id
      name
      absolute_magnitude_h
      is_potentially_hazardous
      close_approach_date
      miss_distance_km
      relative_velocity_kmh
      estimated_diameter_min_m
      estimated_diameter_max_m
      orbiting_body
      nasa_jpl_url
    }
  }
`

export async function fetchAPOD() {
  try {
    const { data } = await client.query({ query: GET_APOD })
    return data.apod
  } catch (error) {
    throw new Error(`Failed to fetch APOD: ${error.message}`)
  }
}

export async function searchNASAImages(query = 'galaxy', mediaType = 'image', page = 1) {
  try {
    const { data } = await client.query({
      query: SEARCH_IMAGES,
      variables: { query, mediaType, page }
    })
    
    // Transform GraphQL response to match expected format
    const items = data.searchImages.items.map(item => ({
      data: [{
        nasa_id: item.nasa_id,
        title: item.title,
        description: item.description,
        date_created: item.date_created,
        center: item.center,
        keywords: item.keywords || []
      }],
      links: [{ href: item.thumbnail }]
    }))
    
    return {
      collection: {
        items,
        metadata: {
          total_hits: data.searchImages.total_hits
        }
      }
    }
  } catch (error) {
    throw new Error(`Failed to search NASA images: ${error.message}`)
  }
}

export async function fetchPopularNASAImages(topic = 'nebula') {
  return searchNASAImages(topic, 'image', 1)
}

export async function fetchNEOs(startDate = null, endDate = null) {
  try {
    const variables = {}
    if (startDate) variables.startDate = startDate
    if (endDate) variables.endDate = endDate
    
    const { data } = await client.query({
      query: GET_NEOS,
      variables
    })
    
    // Transform GraphQL response to match expected format
    const neosByDate = {}
    data.nearEarthObjects.forEach(neo => {
      const date = neo.close_approach_date
      if (!neosByDate[date]) {
        neosByDate[date] = []
      }
      
      neosByDate[date].push({
        id: neo.id,
        name: neo.name,
        absolute_magnitude_h: neo.absolute_magnitude_h,
        is_potentially_hazardous_asteroid: neo.is_potentially_hazardous,
        estimated_diameter: {
          meters: {
            estimated_diameter_min: neo.estimated_diameter_min_m,
            estimated_diameter_max: neo.estimated_diameter_max_m
          }
        },
        close_approach_data: [{
          close_approach_date: neo.close_approach_date,
          close_approach_date_full: neo.close_approach_date,
          relative_velocity: {
            kilometers_per_hour: neo.relative_velocity_kmh || null,
            kilometers_per_second: neo.relative_velocity_kmh ? (parseFloat(neo.relative_velocity_kmh) / 3600).toString() : null
          },
          miss_distance: {
            kilometers: neo.miss_distance_km
          },
          orbiting_body: neo.orbiting_body
        }],
        nasa_jpl_url: neo.nasa_jpl_url
      })
    })
    
    return {
      near_earth_objects: neosByDate,
      element_count: data.nearEarthObjects.length
    }
  } catch (error) {
    throw new Error(`Failed to fetch NEO data: ${error.message}`)
  }
}
