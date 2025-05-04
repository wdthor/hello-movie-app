// MovieList.vue
<template>
  <main class="container mx-auto px-4 py-8 md:px-8">
    <div
      v-if="isSearching"
      class="mb-4 flex items-center justify-between gap-4"
    >
      <h2 class="text-2xl font-semibold">Résultats pour "{{ searchQuery }}"</h2>
      <button @click="resetSearch" class="text-blue-500 hover:underline">
        Retour aux films populaires
      </button>
    </div>

    <MovieSearch />

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
      <template v-else-if="loading && !isLoadingMore">
        <MovieSkeleton v-for="n in 10" :key="n" />
      </template>
      <div
        v-else-if="!loading && !displayedMovies.length"
        class="col-span-full py-12 text-center"
      >
        <p class="text-lg text-gray-500">
          {{
            isSearching
              ? 'Aucun film trouvé pour cette recherche'
              : 'Aucun film disponible'
          }}
        </p>
      </div>
    </div>

    <div v-if="isLoadingMore" class="flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div
      v-if="!isLastPage && displayedMovies.length"
      ref="infiniteScrollTrigger"
      class="h-4 w-full"
    ></div>
  </main>
</template>

<script setup lang="ts">
import { useMoviesStore } from '~/stores/movies';
import { useIntersectionObserver } from '@vueuse/core';
import type { Movie } from '~/types/movie';

const moviesStore = useMoviesStore();
const router = useRouter();

const isLoadingMore = ref(false);
const infiniteScrollTrigger = ref<HTMLElement | null>(null);

const loading = computed(() => moviesStore.loading);
const isLastPage = computed(() => moviesStore.isLastPage);
const isSearching = computed(() => moviesStore.isSearching);
const searchQuery = computed(() => moviesStore.searchQuery);

// Films à afficher (résultats de recherche ou films populaires)
const displayedMovies = computed<Movie[]>(() => {
  if (isSearching.value) {
    return moviesStore.searchResults;
  }
  return moviesStore.movies;
});

// Configuration du défilement infini
useIntersectionObserver(
  infiniteScrollTrigger,
  ([{ isIntersecting }]) => {
    if (
      isIntersecting &&
      !loading.value &&
      !isLoadingMore.value &&
      !isLastPage.value
    ) {
      loadMore();
    }
  },
  { threshold: 0.5 }
);

// Navigation vers la page de détail du film
function navigateToMovie(id: number) {
  router.push(`/movies/${id}`);
}

// Charger plus de films
async function loadMore() {
  if (isLoadingMore.value || isLastPage.value) return;

  isLoadingMore.value = true;

  try {
    await moviesStore.loadMore();
  } finally {
    isLoadingMore.value = false;
  }
}

// Réinitialiser la recherche
function resetSearch() {
  moviesStore.resetSearch();
}

// Charger les films populaires au montage du composant
onMounted(async () => {
  if (!displayedMovies.value.length && !loading.value) {
    await moviesStore.fetchPopularMovies();
  }
});
</script>
