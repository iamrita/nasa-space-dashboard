const API_BASE_URL = 'http://localhost:3002'

export async function fetchAPOD() {
  const response = await fetch(`${API_BASE_URL}/api/apod`)
  if (!response.ok) throw new Error('Failed to fetch APOD')
  return response.json()
}

export async function searchNASAImages(query = 'galaxy', mediaType = 'image', page = 1) {
  const params = new URLSearchParams({
    q: query,
    media_type: mediaType,
    page: page.toString()
  })
  const response = await fetch(`${API_BASE_URL}/api/images/search?${params}`)
  if (!response.ok) {
    throw new Error(`Failed to search NASA images (${response.status})`)
  }
  return response.json()
}

export async function fetchPopularNASAImages(topic = 'nebula') {
  return searchNASAImages(topic, 'image', 1)
}

export async function fetchNEOs(startDate = null, endDate = null) {
  const params = new URLSearchParams()
  if (startDate) params.set('start_date', startDate)
  if (endDate) params.set('end_date', endDate)
  
  const url = params.toString() 
    ? `${API_BASE_URL}/api/neo?${params}` 
    : `${API_BASE_URL}/api/neo`
  
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch NEO data')
  return response.json()
}
