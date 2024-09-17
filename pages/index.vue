<script setup lang="ts">
definePageMeta({
  layout: 'home',
})

const online = useOnline()
</script>

<template>
  <div>
    <Logos class="mb-6" />
    <Suspense>
      <ClientOnly>
        <PageView v-if="online" />
        <div v-else class="text-gray:80">
          You're offline
        </div>
      </ClientOnly>
      <template #fallback>
        <div class="text-italic opacity-50">
          <span class="animate-pulse">Loading...</span>
        </div>
      </template>
    </Suspense>
    <InputEntry />
  </div>
</template>
