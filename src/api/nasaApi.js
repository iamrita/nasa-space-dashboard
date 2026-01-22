import { client, APOD_QUERY, SEARCH_IMAGES_QUERY, NEO_QUERY, HEALTH_QUERY } from './apolloClient'

export async function fetchAPOD() {
  const { data } = await client.query({
    query: APOD_QUERY,
    fetchPolicy: 'network-only'
  })
  return data.apod
}

export async function searchNASAImages(query = 'galaxy', mediaType = 'image', page = 1) {
  const { data } = await client.query({
    query: SEARCH_IMAGES_QUERY,
    variables: { query, mediaType, page },
    fetchPolicy: 'network-only'
  })
  
  // Return data directly - the resolver already transforms it
  return data.searchImages
}

export async function fetchPopularNASAImages(topic = 'nebula') {
  return searchNASAImages(topic, 'image', 1)
}

export async function fetchNEOs(startDate = null, endDate = null) {
  const variables = {}
  if (startDate) variables.startDate = startDate
  if (endDate) variables.endDate = endDate
  
  const { data } = await client.query({
    query: NEO_QUERY,
    variables,
    fetchPolicy: 'network-only'
  })
  
  // Transform from array format back to object format for backward compatibility with the component
  const nearEarthObjectsMap = {}
  data.neo.near_earth_objects.forEach(entry => {
    nearEarthObjectsMap[entry.date] = entry.objects
  })
  
  return {
    element_count: data.neo.element_count,
    near_earth_objects: nearEarthObjectsMap
  }
}

export async function fetchHealth() {
  const { data } = await client.query({
    query: HEALTH_QUERY,
    fetchPolicy: 'network-only'
  })
  return data.health
}
