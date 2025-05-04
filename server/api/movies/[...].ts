// server/api/movies/[...].ts
import { MoviesResponse, MovieDetails } from '~/types/movie';

export default defineEventHandler(async event => {
  const path = event.path?.split('/').filter(Boolean);
  const query = getQuery(event);
  console.log('path :', path);

  // Route pour les films populaires
  if (path?.includes('popular?page=' + query.page)) {
    return getPopularMovies(event);
  }

  // Route pour la recherche de films
  if (path?.includes(`search?query=${query.query}&page=${query.page}`)) {
    return searchMovies(event);
  }

  // Route pour les détails d'un film
  if (path?.[2] && !isNaN(Number(path[2]))) {
    event.context.params = { id: path[2] };
    return getMovieDetails(event);
  }

  throw createError({
    statusCode: 404,
    statusMessage: 'Route non trouvée',
  });

  // const config = useRuntimeConfig()
  // const query = getQuery(event)

  // const res = await $fetch(`${config.public.tmdbBaseUrl}/movie/popular`, {
  //   params: {
  //     api_key: config.tmdbApiKey,
  //     page: query.page || 1,
  //   },
  // })

  // return res
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
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la récupération des films populaires',
    });
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

export const getMovieDetails = defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "L'ID du film est requis",
    });
  }

  try {
    // Récupérer les détails du film
    const movieDetails = await $fetch<MovieDetails>(
      `${config.public.tmdbBaseUrl}/movie/${id}`,
      {
        method: 'GET',
        params: {
          api_key: config.tmdbApiKey,
          language: 'fr-FR',
          append_to_response: 'credits',
        },
      }
    );

    return movieDetails;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${id}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la récupération des détails du film',
    });
  }
});
