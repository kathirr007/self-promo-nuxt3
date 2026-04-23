<script setup lang="ts">
import type { LandingPageProps, LandingPageEmits } from '~/types'
const props = defineProps<LandingPageProps>()

const emit = defineEmits<LandingPageEmits>()

const categoryStore = useCategoryStore()
const categories = computed(() => categoryStore.items)

const uploadedFiles = ref<ImageItem[]>([])
const imagesInput = ref<HTMLInputElement | null>(null)
const image = ref<string[]>([])

const titleError = ref('')
const titleTouched = ref(false)

const titleValid = computed(() => props.project.title?.length >= 10)

onMounted(() => {
  const firstImage = props.project.images.at(0)
  if (firstImage !== undefined && typeof firstImage.location !== 'undefined') {
    uploadedFiles.value = props.project.images
  }
  titleTouched.value = true
})

function formatNames(files: File[]): string {
  if (!files.length)
    return 'No file chosen'
  return files.length === 1 ? (files.at(0)?.name ?? '') : `${files.length} files selected`
}

function imagesAdd(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files ?? [])
  image.value = files.map(f => URL.createObjectURL(f))
}

function removeImage(index: number) {
  image.value.splice(index, 1)
}

async function removeS3Image(index: number, field: string) {
  const item = uploadedFiles.value.at(index)
  if (!item)
    return
  uploadedFiles.value.splice(index, 1)
  emit('projectImageUpdated', { index, field })
}

function emitProjectValue(e: Event | string, field: string) {
  const value = typeof e === 'string' ? e : (e as Event & { target: HTMLInputElement | HTMLSelectElement }).target?.value ?? e
  if (field === 'category') {
    const found = categories.value.find((c: Category) => c._id === value)
    return emit('projectValueUpdated', { value: found, field })
  }
  emit('projectValueUpdated', { value, field })
}
</script>

<template>
  <div class="card manage-card">
    <header class="card-header card-section">
      <h2 class="card-header-title">
        Project Landing Page
      </h2>
    </header>
    <div class="card-content card-section">
      <form>
        <div class="field">
          <label class="label" for="ProjectTitle">Project title</label>
          <div class="control">
            <input
              id="ProjectTitle"
              :value="project.title"
              class="input"
              type="text"
              placeholder="Amazing Project Title"
              @input="emitProjectValue($event, 'title')"
              @blur="titleTouched = true"
            >
            <div v-if="titleTouched && !titleValid" class="form-error">
              <span class="help is-danger">Title should be minimum 10 characters</span>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label" for="ProjectSubtitle">Project subtitle</label>
          <div class="control">
            <input
              id="ProjectSubtitle"
              :value="project.subtitle !== 'undefined' ? project.subtitle : ''"
              class="input"
              type="text"
              placeholder="Awesome Project Subtitle"
              @input="emitProjectValue($event, 'subtitle')"
            >
          </div>
        </div>

        <div class="field">
          <label class="label">Project description</label>
          <div class="control">
            <EditorProjectEditor
              :initial-content="project.description || ''"
              @editor-updated="(content: string) => emitProjectValue(content, 'description')"
            />
          </div>
        </div>

        <div class="field">
          <label class="label" for="projectCategory">Category</label>
          <div class="select">
            <select id="projectCategory" :value="project.category._id" @change="emitProjectValue($event, 'category')">
              <option v-for="category in categories" :key="category._id" :value="category._id">
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="field">
          <label class="label">Project Image</label>
          <div class="columns">
            <div class="column centered p-0">
              <div class="file has-name is-fullwidth">
                <input
                  id="productPhoto"
                  ref="imagesInput"
                  class="file-input"
                  type="file"
                  multiple
                  title=" "
                  @change="imagesAdd"
                  @input="emitProjectValue($event, 'images')"
                >
                <label for="productPhoto" class="file-label">
                  <span class="file-cta">
                    <span class="file-label">{{ formatNames(Array.from((imagesInput as HTMLInputElement)?.files ?? [])) }}</span>
                  </span>
                </label>
              </div>

              <div v-if="uploadedFiles.length !== 0" class="notification is-danger is-light my-2" role="alert">
                Note: Uploading new images will replace the existing images
              </div>

              <figure
                v-if="uploadedFiles.length !== 0 && image.length === 0"
                class="uploaded-files is-justify-content-center is-flex is-flex-wrap-wrap p-2"
              >
                <div
                  v-for="(img, index) in uploadedFiles"
                  :key="index"
                  class="img-wrap p-2"
                  tabindex="0"
                >
                  <img :src="img.location" class="img-thumbnail multiple-images" :alt="(img.originalname.split('.').at(0)) ?? img.originalname">
                  <i
                    role="button"
                    aria-label="remove-image"
                    class="delete-img fas fa-times-circle"
                    tabindex="0"
                    @click="removeS3Image(index, 'images')"
                  />
                </div>
              </figure>

              <div v-else class="uploaded-files is-justify-content-center is-flex is-flex-wrap-wrap p-2">
                <div v-for="(prodImage, index) in image" :key="index" class="img-wrap p-2" tabindex="0">
                  <img :src="prodImage" class="img-thumbnail" :alt="`uploaded-file-${index + 1}`">
                  <i
                    role="button"
                    aria-label="remove-image"
                    class="delete-img fas fa-times-circle"
                    @click="removeImage(index)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label" for="ProjectLink">Project Link</label>
          <div class="control">
            <input
              id="ProjectLink"
              :value="project.productLink !== 'undefined' ? project.productLink : ''"
              class="input"
              type="text"
              placeholder="https://kathirr007-portfolio.herokuapp.com/"
              @input="emitProjectValue($event, 'productLink')"
            >
          </div>
        </div>

        <div class="field">
          <label class="label" for="ProjectRepositoryLink">Project Repository Link</label>
          <div class="control">
            <input
              id="ProjectRepositoryLink"
              :value="project.promoVideoLink !== 'undefined' ? project.promoVideoLink : ''"
              class="input"
              type="text"
              placeholder="https://kathirr007-portfolio.herokuapp.com/"
              @input="emitProjectValue($event, 'promoVideoLink')"
            >
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.uploaded-files {
  .img-wrap {
    position: relative;
    width: 25%;

    .img-thumbnail {
      padding: 1rem;
      background-color: #fff;
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
      max-width: 100%;
      height: auto;
    }

    .delete-img.fas {
      opacity: 0;
      position: absolute;
      right: 5px;
      top: 0;
      cursor: pointer;
      font-size: 18px !important;
      color: orangered !important;
      transition: opacity 0.2s ease-in;
    }

    &:hover .delete-img.fas {
      opacity: 1;
    }
  }
}
</style>
