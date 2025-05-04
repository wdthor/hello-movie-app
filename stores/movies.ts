// stores/movies.ts
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import type {
  Movie,
  MovieDetails,
  MoviesResponse,
  MovieComment,
} from '~/types/movie';

export const useMoviesStore = defineStore('movies', () => {
  const movies = ref<Movie[]>([]);
  const searchResults = ref<Movie[]>([]);
  const currentMovie = ref<MovieDetails | null>(null);
  const loading = ref(false);
  const searching = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(0);
  const searchQuery = ref('');
  const searchPage = ref(1);

  const isLastPage = computed(() => currentPage.value >= totalPages.value);
  const isSearching = computed(() => searchQuery.value.trim() !== '');

  async function fetchPopularMovies(page: number = 1) {
    if (loading.value) return;

    loading.value = true;

    try {
      const response = await $fetch<MoviesResponse>('/api/movies/popular', {
        method: 'GET',
        params: { page },
      });

      if (page === 1) {
        movies.value = response.results;
      } else {
        movies.value = [...movies.value, ...response.results];
      }

      currentPage.value = response.page;
      totalPages.value = response.total_pages;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des films populaires:',
        error
      );
    } finally {
      loading.value = false;
    }
  }

  async function searchMovies(query: string, page: number = 1) {
    if (searching.value || !query.trim()) return;

    searching.value = true;

    try {
      const response = await $fetch<MoviesResponse>('/api/movies/search', {
        method: 'GET',
        params: { query, page },
      });

      if (page === 1) {
        searchResults.value = response.results;
      } else {
        searchResults.value = [...searchResults.value, ...response.results];
      }

      searchPage.value = response.page;
      totalPages.value = response.total_pages;
    } catch (error) {
      console.error('Erreur lors de la recherche de films:', error);
    } finally {
      searching.value = false;
    }
  }

  async function fetchMovieDetails(id: number) {
    loading.value = true;

    try {
      const movieDetails = await $fetch<MovieDetails>(`/api/movies/${id}`);
      currentMovie.value = movieDetails;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des détails du film ${id}:`,
        error
      );
    } finally {
      loading.value = false;
    }
  }

  function getMovieComments(movieId: number): MovieComment[] {
    const storageKey = `movie_comments_${movieId}`;
    const storedComments = localStorage.getItem(storageKey);

    if (storedComments) {
      return JSON.parse(storedComments);
    }

    return [];
  }

  function addMovieComment(
    movieId: number,
    comment: Omit<MovieComment, 'id' | 'timestamp'>
  ) {
    const storageKey = `movie_comments_${movieId}`;
    const comments = getMovieComments(movieId);

    const newComment: MovieComment = {
      ...comment,
      id: uuidv4(),
      timestamp: Date.now(),
    };

    comments.unshift(newComment);
    localStorage.setItem(storageKey, JSON.stringify(comments));

    return newComment;
  }

  function resetSearch() {
    searchQuery.value = '';
    searchResults.value = [];
    searchPage.value = 1;
  }

  function loadMore() {
    if (isSearching.value) {
      searchMovies(searchQuery.value, searchPage.value + 1);
    } else {
      fetchPopularMovies(currentPage.value + 1);
    }
  }

  return {
    movies,
    searchResults,
    currentMovie,
    loading,
    searching,
    currentPage,
    totalPages,
    searchQuery,
    isLastPage,
    isSearching,
    fetchPopularMovies,
    searchMovies,
    fetchMovieDetails,
    getMovieComments,
    addMovieComment,
    resetSearch,
    loadMore,
  };
});
