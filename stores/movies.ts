import { defineStore } from 'pinia';
import type { Movie, MoviesResponse } from '~/types/movie';

export const useMoviesStore = defineStore('movies', () => {
  const movies = ref<Movie[]>([]);
  const loading = ref(false);
  const searching = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const searchResults = ref<Movie[]>([]);
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
    console.log('IN SEARCH');

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
    loading,
    searching,
    currentPage,
    totalPages,
    searchQuery,
    isLastPage,
    isSearching,
    fetchPopularMovies,
    searchMovies,
    resetSearch,
    loadMore,
  };
});
