<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const categoryStore = useAdminCategoryStore()
const canProceed = ref(false)
const form = reactive({ title: '' })

function mergeFormData({ data, isValid }: { data: { title: string }, isValid: boolean }) {
  Object.assign(form, data)
  canProceed.value = isValid
}

async function createCategory() {
  await categoryStore.createCategory({ name: form.title })
}
</script>

<template>
  <div class="full-page-takeover-window">
    <div class="full-page-takeover-page">
      <SharedHeader title="Create Category" exit-link="/admin/categories" />
      <div class="project-create full-page-takeover-container">
        <div class="container">
          <AdminProjectCreateStep1 @step-updated="mergeFormData" />
        </div>
        <div class="full-page-footer-row">
          <div class="container">
            <div class="full-page-footer-col">
              <div class="empty-container" />
            </div>
            <div class="full-page-footer-col">
              <button :disabled="!canProceed" class="button is-success float-right" @click="createCategory">
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.float-right {
  float: right;
}
.empty-container {
  width: 1px;
  height: 1px;
}
.project-create {
  &-wrapper {
    margin-top: 60px;
    text-align: center;
  }
  &-form {
    margin-top: 60px;
    &-group {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .select {
      width: 100%;
      > select {
        width: 100%;
      }
    }
  }
}
</style>
