<script setup lang="ts">
const { data } = await useFetch('/api/hello')
const { data: projects } = await useFetch('/api/projects')
</script>

<template>
  <pre>{{ data }}</pre>
  <ul>
    <li v-for="item in projects" :key="item._id">
      {{ item.title }}
    </li>
  </ul>
</template>
