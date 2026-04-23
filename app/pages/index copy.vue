<script setup lang="ts">
import { hydrateOnIdle } from 'vue'
import LazyHydrate from 'vue-lazy-hydration'

// Define interfaces for type safety
interface Project {
  _id: string
  title: string
  subtitle: string
  category: {
    name: string
  }
  wsl?: any
}

interface Experience {
  _id: string
}

interface Hero {
  title?: string
  subtitle?: string
  image?: string
  product?: {
    productLink?: string
  }
}

// Component imports using lazy loading
const hero = defineAsyncComponent({
  loader: () => import('~/components/shared/Hero.vue'),
  loadingComponent: {
    template: '<div class="hero-placeholder">Loading...</div>',
  },
  hydrate: hydrateOnIdle(),
})
const heroSlider = defineAsyncComponent(() => import('~/components/shared/heroSlider'))
const projectCard = defineAsyncComponent(() => import('~/components/projectCard'))
const experienceCard = defineAsyncComponent(() => import('~/components/experienceCard'))
const ProjectCardTooltip = defineAsyncComponent(() => import('~/components/ProjectCardTooltip'))

// Store state
const { $store } = useNuxtApp()

// Computed properties for store state
const projects = computed<Project[]>(() => $store.state.project.items)
const featuredExperiences = computed<Experience[]>(() => $store.state.experiences.items.featured)
const projectHero = computed<Hero>(() => $store.state.heroes.projectHero || {})
const projectHeros = computed<Hero>(() => $store.state.heroes.projectHero || {})

// Fetch data on server-side
await $store.dispatch('project/fetchProjects')
await $store.dispatch('experiences/fetchFeaturedExperiences', {
  'filter[featured]': true,
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <!-- <hero
      :title="projectHero.title"
      :subtitle="projectHero.subtitle"
      :image="projectHero.image"
      :promoLink="projectHero.product && projectHero.product.productLink"
    /> -->
    <LazyHydrate when-idle>
      <hero-slider :heroes="projectHeros" />
    </LazyHydrate>
    <!-- <hero v-else/> -->

    <!-- Hero Section end -->
    <section class="section p-3">
      <div class="container">
        <h1 class="title my-3">
          Featured Projects
        </h1>
        <div class="columns is-multiline section-cards">
          <div
            v-for="project in projects"
            :key="project._id"
            class="column is-half-tablet is-one-third-widescreen is-one-quarter-fullhd is-flex"
          >
            <!-- CARD-ITEM -->
            <v-popover
              offset="16"
              trigger="hover"
              placement="right-start"
              class="slide-left is-flex is-flex-grow-1"
            >
              <LazyHydrate when-idle>
                <project-card :project="project" />
              </LazyHydrate>
              <template #popover>
                <LazyHydrate on-interaction>
                  <ProjectCardTooltip
                    :title="project.title"
                    :subtitle="project.category.name"
                    :description="project.subtitle"
                    :wsl="project.wsl"
                  />
                </LazyHydrate>
              </template>
            </v-popover>
            <!-- CARD-ITEM-END -->
          </div>
        </div>
      </div>
    </section>
    <section class="section p-3">
      <div class="container">
        <h1 class="title my-3">
          Recent Experiences
        </h1>
        <div class="columns is-multiline section-cards">
          <div
            v-for="experience in featuredExperiences"
            :key="experience._id"
            class="column is-half-tablet is-one-third-widescreen is-one-quarter-fullhd"
          >
            <!-- CARD-ITEM -->
            <LazyHydrate when-visible>
              <experience-card :experience="experience" />
            </LazyHydrate>
            <!-- CARD-ITEM-END -->
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
// card item

// card item end

// hero

// hero

// Home page
.links {
  padding-top: 15px;
}
.slide-left {
  > div {
    /* height: 100%; */
  }
}
</style>

<style lang="scss">
.v-popover {
  &.slide-left {
    .trigger {
      width: 100%;
    }
  }
}
.toasted {
  &.toasted-primary {
    strong {
      color: #fff !important;
      font-weight: bold;
    }
  }
}

.section-cards {
  .column {
    padding-right: 0;
    padding-left: 0;
    @media screen and (min-width: 576px) {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }
  }
}
</style>
