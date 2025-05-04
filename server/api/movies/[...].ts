import { MoviesResponse } from '~/types/movie';

export default defineEventHandler(async (event) => {
    const path = event.path?.split('/').filter(Boolean);
    const query = getQuery(event)
  
  // Route pour les films populaires
  if (path?.includes('popular?page='+query.page)) {
    return getPopularMovies(event);
  }

  throw createError({
    statusCode: 404,
    statusMessage: 'Route non trouvée'
  });

});


  export const getPopularMovies = defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const query = getQuery(event);
    const page = query.page || 1;

    try {
      const response = await $fetch<MoviesResponse>(`${config.public.tmdbBaseUrl}/movie/popular`, {
        method: 'GET',
        params: { api_key: config.tmdbApiKey, page, language: 'fr-FR' }
      });
      
      return response;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des films populaires'
      });
    }
  });
