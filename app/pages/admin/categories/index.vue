<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const router = useRouter()
const categoryStore = useAdminCategoryStore()
const categories = computed(() => categoryStore.items)

await useAsyncData('admin-categories', () => categoryStore.fetchAdminCategories())

const canProceed = ref(false)
const form = reactive({ title: '' })

function mergeFormData({ data, isValid }: { data: { title: string }, isValid: boolean }) {
  Object.assign(form, data)
  canProceed.value = isValid
}

async function createCategory() {
  await categoryStore.createCategory2({ name: form.title })
  const input = document.querySelector<HTMLInputElement>('.pos-rel input')
  input?.focus()
}

async function deleteCategory(category: Record<string, any>) {
  const { $confirm } = useNuxtApp()
  if (await $confirm(`Are you sure you want to delete "${category.name}"?`)) {
    await categoryStore.deleteCategory(category)
  }
}
</script>

<template>
  <div>
    <SharedHeader title="Manage Categories">
      <template #actionMenu>
        <div class="full-page-takeover-header-button">
          <NuxtLink to="/admin/category/create" class="button is-light">
            New Category
          </NuxtLink>
          <NuxtLink to="/" class="button is-danger is-inverted is-outlined">
            <span class="icon"><i class="fas fa-home" /></span>
            <span>FrontEnd</span>
          </NuxtLink>
        </div>
      </template>
    </SharedHeader>
    <div class="projects-page">
      <div class="container">
        <div class="columns">
          <div class="column is-8 is-offset-2">
            <AdminProjectCreateStep1 @step-updated="mergeFormData" @from-categories="createCategory" />
            <h1 class="projects-page-title">
              Available Categories
            </h1>
            <TransitionGroup tag="ul" name="slideDown" role="list" class="categories-list list is-hoverable">
              <li
                v-for="(category, i) in categories"
                :key="category._id"
                class="list-item"
                role="listitem"
                tabindex="0"
              >
                {{ i + 1 }}. {{ category.name }}
                <span class="tags is-pulled-right">
                  <NuxtLink class="tag is-info" :to="`/admin/category/${category._id}`" role="button" tabindex="0">Update</NuxtLink>
                  <span class="tag is-danger" role="button" tabindex="0" @click="deleteCategory(category)" @keyup.enter="deleteCategory(category)">Delete</span>
                </span>
              </li>
            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.projects-page {
  padding-top: 60px;
  &-title {
    font-size: 40px;
    font-weight: bold;
    padding-bottom: 20px;
  }
  .tag {
    text-transform: capitalize;
  }
}
.categories-list.list {
  background-color: #fff;
  border-radius: 4px;
  box-shadow:
    0 2px 3px rgba(10, 10, 10, 0.1),
    0 0 0 1px rgba(10, 10, 10, 0.1);
  .list-item {
    display: block;
    padding: 0.5em 1em;
    .tag {
      opacity: 0;
      transform: scale(1, 0);
      transform-origin: center bottom;
      transition: all 0.25s ease-in;
    }
    &:not(a) {
      color: #4a4a4a;
    }
    &:first-child {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
    &:not(:last-child) {
      border-bottom: 1px solid #dbdbdb;
    }
    &:hover .tag {
      opacity: 1;
      transform: scale(1, 1);
    }
  }
}
</style>
