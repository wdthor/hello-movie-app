<template>
  <div
    class="movie-card overflow-hidden rounded-lg bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
    @click="$emit('click')"
  >
    <div class="movie-poster relative h-80">
      <v-img
        v-if="posterUrl"
        :src="posterUrl"
        :alt="movie.title"
        class="h-full w-full object-cover"
        cover
        :aspect-ratio="2 / 3"
      >
        <template v-slot:placeholder>
          <v-skeleton-loader type="image" class="h-full w-full" />
        </template>
      </v-img>
      <div
        v-else
        class="poster-placeholder flex h-full items-center justify-center bg-gray-200"
      >
        <span class="text-gray-500">
          <v-icon icon="mdi-image-off" size="48"></v-icon>
        </span>
      </div>
      <div
        class="rating absolute right-2 top-2 flex items-center justify-center rounded-full bg-black bg-opacity-75 p-2 text-white"
      >
        <v-rating
          :model-value="roundedRating / 2"
          color="amber"
          density="compact"
          half-increments
          readonly
          size="small"
        ></v-rating>
        <span class="ml-1 text-sm">{{ roundedRating }}</span>
      </div>
    </div>
    <div class="movie-info p-4">
      <h3 class="mb-2 line-clamp-2 text-lg font-medium">{{ movie.title }}</h3>
      <p class="mb-2 text-sm text-gray-500">{{ formattedDate }}</p>
      <p class="line-clamp-3 text-gray-700">
        {{ movie.overview || "Aucune description disponible" }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Movie } from "~/types/movie";

const props = defineProps<{
  movie: Movie;
}>();

defineEmits<{
  (e: "click"): void;
}>();

const config = useRuntimeConfig();

// URL de l'affiche
const posterUrl = computed(() => {
  if (!props.movie.poster_path) return null;
  return `${config.public.tmdbImageBaseUrl}/w500${props.movie.poster_path}`;
});

// Note arrondie pour l'affichage
const roundedRating = computed(() => {
  return Math.round(props.movie.vote_average * 10) / 10;
});

// Date formatée
const formattedDate = computed(() => {
  if (!props.movie.release_date) return "Date inconnue";

  try {
    const date = new Date(props.movie.release_date);
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (e) {
    return "Date invalide";
  }
});
</script>

<style scoped>
.movie-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
