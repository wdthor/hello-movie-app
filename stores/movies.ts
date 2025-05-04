import { defineStore } from 'pinia';
import type { Movie, MoviesResponse } from '~/types/movie';

export const useMoviesStore = defineStore('movies', () => {
  const movies = ref<Movie[]>([]);
  const loading = ref(false);
  async function fetchPopularMovies(page: number = 1) {
    if (loading.value) return;
    
    loading.value = true;
    
    try {
      const response = await $fetch<MoviesResponse>('/api/movies/popular', {
        method: 'GET',
        params: { page }
      });
      
      if (page === 1) {
        movies.value = response.results;
      } else {
        movies.value = [...movies.value, ...response.results];
      }      
    } catch (error) {
      console.error('Erreur lors de la récupération des films populaires:', error);
    } finally {
      loading.value = false;
    }
  }
  
  return {
    movies,
    loading,
    fetchPopularMovies,
  };
});