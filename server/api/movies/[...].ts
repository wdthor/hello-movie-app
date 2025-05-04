import { MoviesResponse } from '~/types/movie';

export default defineEventHandler(async event => {
  const path = event.path?.split('/').filter(Boolean);
  const query = getQuery(event);

  // Route pour les films populaires
  if (path?.includes('popular?page=' + query.page)) {
    return getPopularMovies(event);
  }

  // Route pour la recherche de films
  if (path?.includes(`search?query=${query.query}&page=${query.page}`)) {
    return searchMovies(event);
  }

  return sendError(
    event,
    createError({
      statusCode: 404,
      statusMessage: 'Route non trouvée',
    })
  );
});

export const getPopularMovies = defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const page = query.page || 1;

  try {
    const response = await $fetch<MoviesResponse>(
      `${config.public.tmdbBaseUrl}/movie/popular`,
      {
        method: 'GET',
        params: { api_key: config.tmdbApiKey, page, language: 'fr-FR' },
      }
    );

    return response;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des films populaires',
      })
    );
  }
});

// API de recherche de films
export const searchMovies = defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const searchQuery = query.query;
  const page = query.page || 1;

  if (!searchQuery) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le paramètre de recherche est requis',
    });
  }

  try {
    const response = await $fetch<MoviesResponse>(
      `${config.public.tmdbBaseUrl}/search/movie`,
      {
        method: 'GET',
        params: {
          api_key: config.tmdbApiKey,
          query: searchQuery,
          page,
          language: 'fr-FR',
        },
      }
    );

    return response;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la recherche de films',
    });
  }
});
