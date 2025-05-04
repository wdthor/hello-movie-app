<template>
  <div class="movie-skeleton overflow-hidden rounded-lg bg-white shadow-lg">
    <div class="h-80 animate-pulse bg-gray-200"></div>
    <div class="p-4">
      <div class="mb-3 h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
      <div class="mb-3 h-4 w-1/3 animate-pulse rounded bg-gray-200"></div>
      <div class="mb-2 h-4 w-full animate-pulse rounded bg-gray-200"></div>
      <div class="mb-2 h-4 w-full animate-pulse rounded bg-gray-200"></div>
      <div class="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
