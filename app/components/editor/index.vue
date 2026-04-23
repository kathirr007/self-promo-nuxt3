<script setup lang="ts">
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'

withDefaults(defineProps<{ isSaving?: boolean }>(), { isSaving: false })

const emit = defineEmits<{
  editorMounted: [editor: ReturnType<typeof useEditor>]
  editorUpdated: [{ content: string, title: string, subtitle: string }]
}>()

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    Placeholder.configure({
      placeholder: 'Write your experience story...',
    }),
  ],
  onCreate: ({ editor: e }) => emit('editorMounted', e as any),
})

onBeforeUnmount(() => editor.value?.destroy())

function emitUpdate() {
  if (!editor.value)
    return
  const content = editor.value.getHTML()
  emit('editorUpdated', { content, title: '', subtitle: '' })
}
</script>

<template>
  <div class="editor editor-squished">
    <EditorBasicMenu :editor="editor ?? null">
      <template #saveButton>
        <button :disabled="isSaving" class="button is-success button-save" @click="emitUpdate">
          Save
        </button>
      </template>
    </EditorBasicMenu>
    <EditorBubbleMenu :editor="editor ?? null" />
    <EditorContent class="editor__content" :editor="editor" />
  </div>
</template>

<style lang="scss" scoped>
.button-save {
  float: right;
  background-color: #23d160;

  &:hover {
    background-color: #2bc76c;
  }
  &:disabled {
    cursor: not-allowed;
  }
}
</style>
