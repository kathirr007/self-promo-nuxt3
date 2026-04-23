<script setup lang="ts">
import type { ProjectCardProps } from '~/types'
const props = defineProps<ProjectCardProps>()

function shortenText(text: string, max: number): string {
  return text && text.length > max ? `${text.slice(0, max)}...` : text
}

const vfImages = computed(() => props.project.images.map(img => img.location))
</script>

<template>
  <div class="card">
    <div class="card-image">
      <ClientOnly v-if="vfImages.length > 1">
        <div class="image-strip">
          <img :src="vfImages[0]" alt="Project Image">
        </div>
      </ClientOnly>
      <img
        v-else-if="vfImages.length === 1"
        :src="project.image"
        alt="Project Image"
      >
      <img
        v-else
        src="https://dummyimage.com/265x145/9e9e9e/ffffff&text=Kathirr007+Portfolio"
        alt="Placeholder image"
      >
    </div>
    <div class="card-content">
      <div class="content">
        <h2 class="title is-4">
          {{ shortenText(project.title, 45) }}
        </h2>
      </div>
      <div class="content">
        {{ shortenText(project.subtitle, 45) }}
        <br>
      </div>
    </div>
    <footer class="card-footer">
      <NuxtLink
        :to="`/projects/${project.slug}`"
        :aria-label="project.title"
        class="card-footer-item"
      >
        View project details
      </NuxtLink>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.card-image {
  height: 175px;
  overflow: hidden;
  position: relative;
  padding: 10px;

  img {
    height: 100%;
    width: 100%;
    object-fit: contain;
    object-position: top;
  }

  &:hover {
    opacity: 0.9;
  }

  @media screen and (min-width: 768px) {
    height: 150px;
    padding: 0;
    img {
      object-fit: cover;
      object-position: top;
    }
  }
}

.card {
  display: flex;
  flex-flow: column;
  height: 100%;

  .card-content {
    display: flex;
    flex-flow: column;
    flex: 1;

    .content {
      display: flex;
      flex: 1;
    }
  }
}

.image-strip img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
