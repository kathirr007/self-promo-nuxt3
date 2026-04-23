<script setup lang="ts">
import type { ProductHeroCardProps } from '~/types'
withDefaults(defineProps<ProductHeroCardProps>(), {
  navigateTo: '',
  repoLink: '',
  images: () => [],
})
</script>

<template>
  <div class="card">
    <div class="card-image project-gallery">
      <ClientOnly>
        <div class="gallery-grid">
          <figure v-for="(img, i) in images" :key="i" class="gallery-item">
            <img :src="img.location" :alt="img.originalname.split('.')[0]">
          </figure>
        </div>
      </ClientOnly>
    </div>
    <div class="card-content">
      <div class="field has-addons is-justify-content-center">
        <p class="control">
          <a
            target="_blank"
            :href="navigateTo === 'undefined' ? '' : navigateTo"
            class="button is-danger is-outlined"
          >
            <span class="icon is-small"><i class="fas fa-globe" /></span>
            <span>Project</span>
          </a>
        </p>
        <p v-if="repoLink && repoLink !== 'undefined'" class="control">
          <a :href="repoLink" class="button is-danger is-outlined">
            <span>Github</span>
            <span class="icon is-small"><i class="fab fa-github" /></span>
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
figure.image {
  height: 150px;
  overflow: hidden;
  img {
    object-fit: contain;
    height: 100%;
  }
}

.card {
  z-index: 9999;
  padding: 5px;
  border-radius: 5px;
  box-shadow:
    0 0 1px 1px rgba(20, 23, 28, 0.1),
    0 3px 1px 0 rgba(20, 23, 28, 0.1);
}

.project-gallery {
  .gallery-grid {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;

    .gallery-item {
      width: calc(100% / 5);
      box-shadow: 0 0 4px 0 #ccc;
      transition: all 0.25s ease-in-out;

      &:hover {
        transform: scale(1.2);
        box-shadow: 0 0 4px 4px #ccc;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}
</style>
