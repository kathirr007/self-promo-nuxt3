<script setup lang="ts">
import type { HeroSliderProps } from '~/types'

const props = withDefaults(defineProps<HeroSliderProps>(), {
  heroes: () => [],
  title: 'Super Amazing Promo',
  subtitle: 'Super Amazing Promo Subtitle',
  image: 'https://images.unsplash.com/photo-1510519138101-570d1dca3d66?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1631&q=80',
})

const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % (props.heroes.length || 1)
  }, 5000)
})

onBeforeUnmount(() => {
  if (timer)
    clearInterval(timer)
})
</script>

<template>
  <section class="hero is-black">
    <template v-if="heroes.length">
      <div
        class="hero-body"
        :style="{
          background: `url(${heroes[currentIndex]!.image ?? ''}) no-repeat top center/cover`,
        }"
      >
        <div class="hero-img" />
        <div class="container px-4 py-2">
          <h1 class="title">
            {{ heroes[currentIndex]!.title }}
          </h1>
          <h2 class="subtitle is-hidden-mobile">
            {{ heroes[currentIndex]!.subtitle }}
          </h2>
          <NuxtLink
            :to="heroes[currentIndex]!.product ? `projects/${heroes[currentIndex]!.product!.slug}` : '/'"
            class="button is-danger"
          >
            Project Details
          </NuxtLink>
        </div>
      </div>
    </template>
    <div v-else class="hero-body">
      <div class="hero-img" :style="{ background: `url(${image}) no-repeat center center` }" />
      <div class="container px-4 py-2">
        <h1 class="title">
          {{ title }}
        </h1>
        <h2 class="subtitle is-hidden-mobile">
          {{ subtitle }}
        </h2>
        <NuxtLink to="/" class="button is-danger">
          Learn More!
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero-body {
  position: relative;
}

.hero-img {
  opacity: 0.4;
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  background-size: cover;
}

.is-black {
  background-color: black;
}

.title {
  font-size: 25px;
  @media screen and (min-width: 576px) {
    font-size: 30px;
  }
}

.subtitle {
  font-size: 22px;
}
</style>
