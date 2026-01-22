export const typeDefs = `#graphql
  type APOD {
    title: String!
    explanation: String!
    url: String!
    hdurl: String
    date: String!
    media_type: String!
    copyright: String
  }

  type ImageItem {
    nasa_id: String!
    title: String!
    description: String
    date_created: String
    media_type: String!
    thumbnail: String
    center: String
    keywords: [String!]
  }

  type ImageSearchResult {
    items: [ImageItem!]!
    total_hits: Int
  }

  type NEO {
    id: String!
    name: String!
    absolute_magnitude_h: Float
    is_potentially_hazardous: Boolean!
    close_approach_date: String!
    miss_distance_km: String
    relative_velocity_kmh: String
    estimated_diameter_min_m: Float
    estimated_diameter_max_m: Float
    orbiting_body: String
    nasa_jpl_url: String
  }

  type Query {
    apod: APOD
    searchImages(query: String, mediaType: String, page: Int): ImageSearchResult
    nearEarthObjects(startDate: String, endDate: String): [NEO!]!
  }
`
