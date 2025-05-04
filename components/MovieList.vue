<template>
  <main class="container mx-auto px-4 py-8 md:px-8">
    <div
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      <template v-if="displayedMovies.length">
        <MovieCard
          v-for="movie in displayedMovies"
          :key="movie.id"
          :movie="movie"
          @click="navigateToMovie(movie.id)"
        />
      </template>
      <template v-else-if="loading">
        <MovieSkeleton v-for="n in 10" :key="n" />
      </template>
      <div
        v-else-if="!loading && !displayedMovies.length"
        class="col-span-full py-12 text-center"
      >
        <p class="text-lg text-gray-500">Aucun film disponible</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { useMoviesStore } from "~/stores/movies";
import type { Movie } from "~/types/movie";

const moviesStore = useMoviesStore();
const router = useRouter();

const loading = computed(() => moviesStore.loading);

// Films à afficher
const displayedMovies = computed<Movie[]>(() => {
  return moviesStore.movies;
});

// Navigation vers la page de détail du film
function navigateToMovie(id: number) {
  router.push(`/movies/${id}`);
}

// Charger les films populaires
onMounted(async () => {
  if (!displayedMovies.value.length && !loading.value) {
    await moviesStore.fetchPopularMovies();
  }
});
</script>
