<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <main p="x4 y10" text="center teal-700 dark:gray-200">
    <div class="text-4xl">
      <div i-carbon-warning class="inline-block" />
    </div>
    <div>Not found</div>
    <div>
      <button class="text-sm btn m-3 mt-8" @click="router.back()">
        Back
      </button>
    </div>
  </main>
</template>
