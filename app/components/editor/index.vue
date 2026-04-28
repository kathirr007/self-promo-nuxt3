<script setup lang="ts">
import type { Editor as TiptapEditor } from '@tiptap/vue-3'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { all, createLowlight } from 'lowlight'
import { CustomDocument, Subtitle, Title } from './extensions'

const props = withDefaults(defineProps<{
  isSaving?: boolean
}>(), {
  isSaving: false,
})

const emit = defineEmits<{
  editorMounted: [editor: TiptapEditor]
  editorUpdated: [{ content: string, title: string, subtitle: string }]
}>()

// Create lowlight instance with all languages
const lowlight = createLowlight(all)

const editor = useEditor({
  extensions: [
    CustomDocument,
    Title,
    Subtitle,
    StarterKit.configure({
      document: false, // Disable default document to use our custom one
      underline: false, // Disable underline as we'll add it separately if needed
      codeBlock: false, // Disable default codeBlock to use CodeBlockLowlight instead
    }),
    Placeholder.configure({
      showOnlyCurrent: true,
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
      placeholder: ({ node }) => {
        if (node.type.name === 'title') {
          return 'Your Title here..'
        }
        if (node.type.name === 'subtitle') {
          return 'Your Subtitle here..'
        }
        return 'Write your experience story...'
      },
    }),
    CodeBlockLowlight.configure({
      lowlight,
    }),
  ],
  onCreate: ({ editor: e }) => {
    emit('editorMounted', e as TiptapEditor)
  },
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function getNodeValueByName(name: string): string {
  if (!editor.value)
    return ''

  const docContent = editor.value.state.doc.content
  const nodes = docContent.content
  const node = nodes.find((n: any) => n.type.name === name)

  if (!node)
    return ''

  return node.textContent || ''
}

function emitUpdate() {
  if (!editor.value)
    return

  const content = editor.value.getHTML()
  const title = getNodeValueByName('title')
  const subtitle = getNodeValueByName('subtitle')

  emit('editorUpdated', { content, title, subtitle })
}
</script>

<template>
  <div class="editor editor-squished">
    <EditorBasicMenu v-if="editor" :editor="editor">
      <template #saveButton>
        <button
          :disabled="isSaving"
          class="button is-success button-save"
          @click="emitUpdate"
        >
          Save
        </button>
      </template>
    </EditorBasicMenu>
    <EditorBubbleMenu v-if="editor" :editor="editor" />
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
