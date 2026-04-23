<script setup lang="ts">
import type { ProjectCardTooltipProps } from '~/types'
withDefaults(defineProps<ProjectCardTooltipProps>(), {
  title: '',
  subtitle: '',
  description: '',
  wsl: () => [],
})
</script>

<template>
  <div class="card card-tooltip">
    <div class="card-content">
      <div class="content">
        <div class="media-content">
          <p class="title is-4">
            {{ title }}
          </p>
          <p class="subtitle is-6">
            <i>{{ subtitle }}</i>
          </p>
        </div>
      </div>
      <div class="content" v-html="description" />
      <div class="content">
        <ul class="wsl-list">
          <li v-for="item in wsl" :key="item.value" class="wsl-item">
            {{ item.value }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card-tooltip {
  max-width: 350px;

  .title {
    font-size: 18px;
  }

  .wsl-list {
    margin-left: 13px;

    .wsl-item {
      font-size: 13px;
    }
  }
}
</style>
