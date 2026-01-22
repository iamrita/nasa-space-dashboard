export const typeDefs = `#graphql
  type APOD {
    title: String!
    date: String!
    explanation: String!
    url: String!
    hdurl: String
    media_type: String!
    copyright: String
  }

  type ImageItem {
    id: String!
    title: String
    description: String
    date: String
    center: String
    keywords: [String]
    thumbnail: String
    detailsHref: String
  }

  type ImageSearchMetadata {
    total_hits: Int
  }

  type ImageSearchCollection {
    items: [ImageItem]
    metadata: ImageSearchMetadata
  }

  type ImageSearchResult {
    collection: ImageSearchCollection
  }

  type EstimatedDiameterRange {
    estimated_diameter_min: Float!
    estimated_diameter_max: Float!
  }

  type EstimatedDiameter {
    kilometers: EstimatedDiameterRange!
    meters: EstimatedDiameterRange!
    miles: EstimatedDiameterRange!
    feet: EstimatedDiameterRange!
  }

  type RelativeVelocity {
    kilometers_per_second: String!
    kilometers_per_hour: String!
    miles_per_hour: String!
  }

  type MissDistance {
    astronomical: String!
    lunar: String!
    kilometers: String!
    miles: String!
  }

  type CloseApproachData {
    close_approach_date: String!
    close_approach_date_full: String
    epoch_date_close_approach: Float!
    relative_velocity: RelativeVelocity!
    miss_distance: MissDistance!
    orbiting_body: String!
  }

  type NearEarthObject {
    id: String!
    neo_reference_id: String!
    name: String!
    nasa_jpl_url: String!
    absolute_magnitude_h: Float!
    estimated_diameter: EstimatedDiameter!
    is_potentially_hazardous_asteroid: Boolean!
    close_approach_data: [CloseApproachData]!
    is_sentry_object: Boolean!
  }

  type NEODateEntry {
    date: String!
    objects: [NearEarthObject]!
  }

  type NEOFeed {
    element_count: Int!
    near_earth_objects: [NEODateEntry]!
  }

  type Health {
    status: String!
    timestamp: String!
  }

  type Query {
    apod: APOD
    searchImages(query: String, mediaType: String, page: Int): ImageSearchResult
    neo(startDate: String, endDate: String): NEOFeed
    health: Health
  }
`
