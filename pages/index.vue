<script setup lang="ts">
const { data } = await useFetch('/api/hello')
const { data: products } = await useFetch('/api/projects')
</script>

<template>
  <pre>{{ data }}</pre>
</template>
