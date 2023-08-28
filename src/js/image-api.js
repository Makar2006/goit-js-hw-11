import axios from 'axios';
const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '39114090-cdcc660baf671d3fbbda6673c';

async function fetchImages(query, page, perPage) {
  const params = new URLSearchParams({
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: perPage,
    query: query,
  });

  const response = await axios.get(`${BASE_URL}?key=${API_KEY}&${params}`);
  return response.data;
}

export { fetchImages };
