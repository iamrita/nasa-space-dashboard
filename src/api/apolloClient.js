import { ApolloClient, InMemoryCache, gql, HttpLink } from '@apollo/client'

const API_BASE_URL = 'http://localhost:3002'

export const client = new ApolloClient({
  link: new HttpLink({ uri: `${API_BASE_URL}/graphql` }),
  cache: new InMemoryCache()
})

// GraphQL Queries
export const APOD_QUERY = gql`
  query GetAPOD {
    apod {
      title
      date
      explanation
      url
      hdurl
      media_type
      copyright
    }
  }
`

export const SEARCH_IMAGES_QUERY = gql`
  query SearchImages($query: String, $mediaType: String, $page: Int) {
    searchImages(query: $query, mediaType: $mediaType, page: $page) {
      collection {
        items {
          id
          title
          description
          date
          center
          keywords
          thumbnail
          detailsHref
        }
        metadata {
          total_hits
        }
      }
    }
  }
`

export const NEO_QUERY = gql`
  query GetNEO($startDate: String, $endDate: String) {
    neo(startDate: $startDate, endDate: $endDate) {
      element_count
      near_earth_objects {
        date
        objects {
          id
          neo_reference_id
          name
          nasa_jpl_url
          absolute_magnitude_h
          estimated_diameter {
            meters {
              estimated_diameter_min
              estimated_diameter_max
            }
          }
          is_potentially_hazardous_asteroid
          close_approach_data {
            close_approach_date
            close_approach_date_full
            relative_velocity {
              kilometers_per_hour
            }
            miss_distance {
              kilometers
            }
            orbiting_body
          }
          is_sentry_object
        }
      }
    }
  }
`

export const HEALTH_QUERY = gql`
  query GetHealth {
    health {
      status
      timestamp
    }
  }
`
