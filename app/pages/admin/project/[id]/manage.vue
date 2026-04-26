<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const adminProjectStore = useAdminProjectStore()
const categoryStore = useCategoryStore()
const heroesStore = useHeroesStore()

await useAsyncData(`manage-project-${route.params.id}`, async () => {
  return await Promise.all([
    adminProjectStore.fetchProjectById(route.params.id as string),
    categoryStore.fetchCategories(),
  ])
})

const project = computed(() => adminProjectStore.item)
const canUpdateProject = computed(() => adminProjectStore.canUpdateProject)

const activeStep = ref(1)
const steps = ['AdminTechnologiesUsed', 'AdminLandingPage', 'AdminPrice', 'AdminStatus']

const activeComponent = computed(() => steps[activeStep.value - 1])

function activeComponentClass(step: number) {
  return activeStep.value === step ? 'is-active' : ''
}

function navigateTo(step: number) {
  activeStep.value = step
}

const projectHero = reactive<Record<string, any>>({})

function handleProjectImageUpdate({ index, field }: { index: number, field: string }) {
  adminProjectStore.removeProjectImage(field, index)
}

function handleProjectUpdate({ value, field }: { value: any, field: string }) {
  adminProjectStore.setProjectValue(field, value)
}

async function updateProject() {
  await adminProjectStore.updateProject()
}

async function createProjectHero({ closeModal }: { closeModal: () => void }) {
  const heroData = { ...projectHero, product: { ...project.value } }
  await heroesStore.createHero(heroData)
  closeModal()
}

function applyProjectValues() {
  if (!projectHero.title)
    projectHero.title = project.value.title
  if (!projectHero.subtitle)
    projectHero.subtitle = project.value.subtitle
  if (!projectHero.image)
    projectHero.image = project.value.image
}
</script>

<template>
  <div class="manage-page">
    <SharedHeader :title="project?.title || 'Manage Project'" exit-link="/admin/projects">
      <template #actionMenu>
        <div class="full-page-takeover-header-button">
          <button
            :disabled="!canUpdateProject"
            class="button is-primary is-inverted is-outlined"
            @click="updateProject"
            @keyup.enter="updateProject"
          >
            Save
          </button>
        </div>
        <div class="full-page-takeover-header-button">
          <SharedModal
            open-title="Favorite"
            open-btn-class="button is-primary is-inverted is-outlined"
            title="Make Project Hero"
            @opened="applyProjectValues"
            @submitted="createProjectHero"
          >
            <div>
              <form>
                <div class="field">
                  <label class="label" for="heroTitle">Hero title</label>
                  <span class="label-info">Suggested 64 Characters</span>
                  <div class="control">
                    <input id="heroTitle" v-model="projectHero.title" class="input is-medium" type="text" placeholder="Amazing project title">
                  </div>
                </div>
                <div class="field">
                  <label class="label" for="heroSubTitle">Hero subtitle</label>
                  <span class="label-info">Suggested 128 Characters</span>
                  <input id="heroSubTitle" v-model="projectHero.subtitle" class="input is-medium" type="text" placeholder="Get all of the project for 9.99$">
                </div>
                <div class="field">
                  <label class="label" for="heroImage">Hero image</label>
                  <span class="label-info">Image in format 3 by 1 (720 x 240)</span>
                  <input id="heroImage" v-model="projectHero.image" class="input is-medium" type="text" placeholder="Some image in format 3 by 1 (720 x 240)">
                  <figure class="image project-image is-3by1">
                    <img :src="projectHero.image" :alt="projectHero.title || ''">
                  </figure>
                </div>
              </form>
            </div>
          </SharedModal>
        </div>
      </template>
    </SharedHeader>

    <div class="project-manage">
      <div class="container">
        <div class="columns">
          <div class="column is-3 p-lg">
            <aside class="menu">
              <p class="menu-label">
                Project Editing
              </p>
              <ul class="menu-list">
                <li><a role="button" tabindex="0" :class="activeComponentClass(1)" @click.prevent="navigateTo(1)" @keyup.enter.prevent="navigateTo(1)">Target Technologies</a></li>
                <li><a role="button" tabindex="0" :class="activeComponentClass(2)" @click.prevent="navigateTo(2)" @keyup.enter.prevent="navigateTo(2)">Project Landing Page</a></li>
              </ul>
              <p class="menu-label">
                Project Management
              </p>
              <ul class="menu-list">
                <li><a role="button" tabindex="0" :class="activeComponentClass(4)" @click.prevent="navigateTo(4)" @keyup.enter.prevent="navigateTo(4)">Status</a></li>
              </ul>
            </aside>
          </div>
          <div class="column">
            <KeepAlive>
              <Transition name="slideUp" mode="out-in">
                <component
                  :is="activeComponent"
                  :project="project"
                  @project-image-updated="handleProjectImageUpdate"
                  @project-value-updated="handleProjectUpdate"
                />
              </Transition>
            </KeepAlive>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.manage-page {
  .label-info {
    font-size: 13px;
    color: #585858;
    font-style: italic;
  }
  .project-manage {
    padding-top: 40px;
    .menu {
      padding-top: 30px;
      &-label {
        font-size: 20px;
        color: black;
      }
      &-list > li {
        font-size: 18px;
        margin-top: 10px;
        > a.is-active {
          background-color: transparent;
          color: inherit;
          border-right: 3px solid #0a0548;
        }
      }
    }
    .card {
      &-section {
        padding: 20px;
      }
      &-header-title {
        padding: 0;
        color: #6e767e;
        font-weight: 400;
        font-size: 25px;
      }
    }
    .project-image img {
      object-fit: cover;
    }
  }
}
</style>
