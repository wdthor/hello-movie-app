<template>
  <div class="search-container mb-8">
    <v-text-field
      v-model="searchInput"
      label="Rechercher un film"
      prepend-inner-icon="mdi-magnify"
      clearable
      variant="outlined"
      rounded="lg"
      hide-details
      :loading="loading"
      @update:model-value="debouncedSearch"
      @keyup.enter="search"
      @click:clear="clearSearch"
    >
      <template v-slot:append>
        <v-btn
          v-if="searchInput"
          icon="mdi-magnify"
          color="primary"
          @click="search"
          :loading="loading"
        />
      </template>
    </v-text-field>
  </div>
</template>

<script setup lang="ts">
import { useMoviesStore } from "~/stores/movies";
import { useDebounceFn } from "@vueuse/core";

const moviesStore = useMoviesStore();
const searchInput = ref("");
const loading = computed(() => moviesStore.searching);

// Synchroniser avec le store au montage
onMounted(() => {
  if (moviesStore.searchQuery) {
    searchInput.value = moviesStore.searchQuery;
  }
});

// Recherche debounce
const debouncedSearch = useDebounceFn(async () => {
  if (searchInput.value.trim().length > 2) {
    await search();
  } else if (searchInput.value.trim() === "") {
    clearSearch();
  }
}, 500);

// Fonction de recherche
async function search() {
  if (searchInput.value.trim()) {
    moviesStore.searchQuery = searchInput.value;
    await moviesStore.searchMovies(searchInput.value);
  }
}

// Effacer la recherche
function clearSearch() {
  searchInput.value = "";
  moviesStore.resetSearch();
}
</script>

<style scoped>
.search-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>
