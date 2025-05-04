<template>
  <div>
    <!-- Loader pendant le chargement -->
    <div v-if="loading" class="flex h-64 items-center justify-center">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <main v-else-if="movie" class="">
      <div
        class="backdrop relative w-full overflow-hidden"
        :style="backdropStyle"
      >
        <div
          class="backdrop-overlay absolute inset-0 bg-black bg-opacity-50"
        ></div>
        <div class="container relative z-10 mx-auto px-4 py-12 md:px-8">
          <div class="flex flex-col items-start gap-8 md:flex-row">
            <!-- Affiche -->
            <div
              class="movie-poster w-full flex-shrink-0 overflow-hidden rounded-lg shadow-lg md:w-1/4"
            >
              <v-img
                v-if="posterUrl"
                :src="posterUrl"
                :alt="movie.title"
                :aspect-ratio="2 / 3"
                class="h-full w-full object-cover"
                cover
              />
              <div
                v-else
                class="poster-placeholder flex h-96 items-center justify-center bg-gray-200"
              >
                <span class="text-gray-500">
                  <v-icon icon="mdi-image-off" size="48"></v-icon>
                </span>
              </div>
            </div>

            <!-- Informations du film -->
            <div class="movie-info flex-grow text-white">
              <h1 class="mb-2 text-3xl font-bold md:text-4xl">
                {{ movie.title }}
              </h1>
              <p v-if="movie.tagline" class="mb-4 text-lg italic text-gray-300">
                {{ movie.tagline }}
              </p>

              <div class="mb-4 flex items-center gap-4">
                <v-rating
                  :model-value="movie.vote_average / 2"
                  color="amber"
                  half-increments
                  readonly
                  size="small"
                ></v-rating>
                <span
                  >{{ roundedRating }}/10 ({{ movie.vote_count }} votes)</span
                >
              </div>
              <div class="genres mb-4 flex flex-wrap gap-2">
                <v-chip
                  v-for="genre in movie.genres"
                  :key="genre.id"
                  color="primary"
                  label
                  variant="flat"
                  size="small"
                  class="mr-2"
                >
                  {{ genre.name }}
                </v-chip>
              </div>

              <p class="overview mb-6 text-lg">{{ movie.overview }}</p>

              <div
                class="details grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-2"
              >
                <div v-if="director" class="detail-item">
                  <span class="text-gray-300">Réalisateur:</span>
                  <p>{{ director.name }}</p>
                </div>

                <div v-if="releaseDate" class="detail-item">
                  <span class="text-gray-300">Date de sortie:</span>
                  <p>{{ releaseDate }}</p>
                </div>

                <div v-if="movie.runtime" class="detail-item">
                  <span class="text-gray-300">Durée:</span>
                  <p>{{ formatRuntime(movie.runtime) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-8 md:px-8">
        <!-- Cast principal -->
        <section class="mb-12">
          <h2 class="mb-6 text-2xl font-bold">Têtes d'affiche</h2>

          <div
            v-if="mainCast.length"
            class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          >
            <div v-for="actor in mainCast" :key="actor.id" class="cast-card">
              <div class="overflow-hidden rounded-lg">
                <v-img
                  v-if="getProfileUrl(actor.profile_path)"
                  :src="getProfileUrl(actor.profile_path)"
                  :alt="actor.name"
                  height="180"
                  cover
                />
                <div
                  v-else
                  class="flex h-44 items-center justify-center bg-gray-200"
                >
                  <v-icon icon="mdi-account" size="48" color="grey"></v-icon>
                </div>
              </div>
              <div class="mt-2">
                <p class="font-semibold">{{ actor.name }}</p>
                <p class="text-sm text-gray-600">{{ actor.character }}</p>
              </div>
            </div>
          </div>

          <div v-else class="py-4 text-center text-gray-500">
            Aucune information sur le casting disponible
          </div>
        </section>

        <!-- Section commentaires -->
        <section class="comments-section">
          <h2 class="mb-6 text-2xl font-bold">Commentaires</h2>

          <!-- Formulaire de commentaire -->
          <div class="comment-form mb-8 rounded-lg bg-gray-50 p-6 shadow">
            <h3 class="mb-4 text-xl font-semibold">Ajouter un commentaire</h3>

            <v-form @submit.prevent="submitComment" ref="form">
              <div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <v-text-field
                  v-model.trim="commentForm.username"
                  label="Nom d'utilisateur"
                  :rules="usernameRules"
                  variant="outlined"
                  required
                ></v-text-field>

                <div class="rating-input">
                  <label class="mb-2 block text-sm font-medium"
                    >Votre note (1-10)</label
                  >
                  <v-slider
                    v-model="commentForm.rating"
                    color="amber"
                    min="1"
                    max="10"
                    thumb-label
                    step="1"
                    show-ticks="always"
                    :ticks="ratingTicks"
                  ></v-slider>
                </div>
              </div>

              <div class="mb-6">
                <label class="mb-2 block text-sm font-medium"
                  >Votre message</label
                >
                <editor
                  api-key="{{ config.tinymceApiKey }}"
                  v-model.trim="commentForm.message"
                  :init="{
                    height: 300,
                    menubar: false,
                    plugins: 'link lists',
                    toolbar:
                      'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link',
                  }"
                />
                <div v-if="messageError" class="mt-1 text-sm text-red-500">
                  {{ messageError }}
                </div>
              </div>

              <v-btn
                color="primary"
                type="submit"
                :loading="submitting"
                :disabled="submitting"
                block
              >
                Envoyer
              </v-btn>
            </v-form>
          </div>

          <!-- Liste des commentaires -->
          <div class="comments-list">
            <div v-if="comments.length">
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="comment mb-4 rounded-lg bg-white p-6 shadow-sm"
              >
                <div class="mb-3 flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <v-avatar color="primary" size="36">
                      {{ comment.username.charAt(0).toUpperCase() }}
                    </v-avatar>
                    <h4 class="text-lg font-medium">{{ comment.username }}</h4>
                  </div>
                  <div class="flex items-center">
                    <v-rating
                      :model-value="comment.rating / 2"
                      color="amber"
                      half-increments
                      readonly
                      size="x-small"
                    ></v-rating>
                    <span class="ml-1 font-medium text-amber-500"
                      >{{ comment.rating }}/10</span
                    >
                  </div>
                </div>

                <div
                  class="comment-content mb-2"
                  v-html="comment.message"
                ></div>

                <div class="text-sm text-gray-500">
                  {{ formatCommentDate(comment.timestamp) }}
                </div>
              </div>

              <div
                v-if="!comments.length"
                class="py-8 text-center text-gray-500"
              >
                Soyez le premier à commenter ce film !
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Message d'erreur si film non trouvé -->
    <div v-else class="container mx-auto px-4 py-16 text-center">
      <h1 class="mb-4 text-3xl font-bold">Film non trouvé</h1>
      <p class="mb-8">Nous n'avons pas pu trouver le film que vous cherchez.</p>
      <v-btn color="primary" to="/" prepend-icon="mdi-arrow-left">
        Retour à l'accueil
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMoviesStore } from '~/stores/movies';
import type { MovieDetails, MovieComment, Cast, Crew } from '~/types/movie';
import Editor from '@tinymce/tinymce-vue';

const route = useRoute();
const config = useRuntimeConfig();
const moviesStore = useMoviesStore();

// Récupérer l'ID du film depuis l'URL
const movieId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? parseInt(id) : 0;
});

const loading = ref(true);
const movie = ref<MovieDetails | null>(null);
const comments = ref<MovieComment[]>([]);
const submitting = ref(false);
const form = ref(null);
const messageError = ref('');

const commentForm = reactive({
  username: '',
  message: '',
  rating: 7, // Valeur par défaut
});

const usernameRules = [
  (v: string) => !!v || "Le nom d'utilisateur est requis",
  (v: string) =>
    (v && v.length >= 3) ||
    "Le nom d'utilisateur doit comporter au moins 3 caractères",
  (v: string) =>
    (v && v.length <= 50) ||
    "Le nom d'utilisateur ne doit pas dépasser 50 caractères",
  (v: string) =>
    /^[a-zA-Z\s]+$/.test(v) ||
    "Le nom d'utilisateur ne peut contenir que des lettres",
];

const ratingTicks = {
  1: '1',
  2: '',
  3: '',
  4: '',
  5: '5',
  6: '',
  7: '',
  8: '',
  9: '',
  10: '10',
};

// Réalisateur
const director = computed<Crew | undefined>(() => {
  if (!movie.value?.credits?.crew) return undefined;
  return movie.value.credits.crew.find(person => person.job === 'Director');
});

// Cast principal (limité aux 6 premiers)
const mainCast = computed<Cast[]>(() => {
  if (!movie.value?.credits?.cast) return [];
  return movie.value.credits.cast.filter(actor => actor.order < 10).slice(0, 6);
});

// URL de l'affiche
const posterUrl = computed(() => {
  if (!movie.value?.poster_path) return null;
  return `${config.public.tmdbImageBaseUrl}/w500${movie.value.poster_path}`;
});

const backdropStyle = computed(() => {
  if (!movie.value?.backdrop_path) return {};

  return {
    backgroundImage: `url(${config.public.tmdbImageBaseUrl}/original${movie.value.backdrop_path})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    minHeight: '500px',
  };
});

// Note arrondie
const roundedRating = computed(() => {
  if (!movie.value) return 0;
  return Math.round(movie.value.vote_average * 10) / 10;
});

// Date formatée
const releaseDate = computed(() => {
  if (!movie.value?.release_date) return null;

  try {
    const date = new Date(movie.value.release_date);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    return null;
  }
});

// Formater le temps d'exécution
function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
}

function getProfileUrl(path: string | null): string {
  if (!path) return '';
  return `${config.public.tmdbImageBaseUrl}/w185${path}`;
}

// Formater la date d'un commentaire
function formatCommentDate(timestamp: number): string {
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    return '';
  }
}

async function submitComment() {
  if (!movieId.value) return;

  submitting.value = true;

  if (!commentForm.username.trim()) {
    messageError.value = "Le nom d'utilisateur est requis";
    submitting.value = false;
    return;
  }

  // Validation du message (TinyMCE)
  let plainMessage = commentForm.message.replace(/<[^>]*>/g, '').trim();
  plainMessage = plainMessage.replaceAll('&nbsp;', '');

  if (plainMessage.length < 3) {
    messageError.value = 'Le message doit comporter au moins 3 caractères';
    submitting.value = false;
    return;
  }

  if (plainMessage.length > 500) {
    messageError.value = 'Le message ne doit pas dépasser 500 caractères';
    submitting.value = false;
    return;
  }

  messageError.value = '';

  try {
    // Ajouter le commentaire
    moviesStore.addMovieComment(movieId.value, {
      username: commentForm.username,
      message: commentForm.message,
      rating: commentForm.rating,
    });

    // Réinitialiser le formulaire
    commentForm.message = '';
    commentForm.rating = 7;

    // Recharger les commentaires
    loadComments();
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error);
  } finally {
    submitting.value = false;
  }
}

// Charger les commentaires
function loadComments() {
  if (!movieId.value) return;
  comments.value = moviesStore.getMovieComments(movieId.value);
}

// Charger les détails du film
async function loadMovie() {
  loading.value = true;

  try {
    await moviesStore.fetchMovieDetails(movieId.value);
    movie.value = moviesStore.currentMovie;
  } catch (error) {
    console.error('Erreur lors du chargement du film:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadMovie();
  loadComments();
});
</script>

<style scoped>
.backdrop {
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.5) 100%
    );
  }
}

.comment-content {
  :deep(p) {
    margin-bottom: 0.5rem;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;
  }
}
</style>
