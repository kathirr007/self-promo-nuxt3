<script setup lang="ts">
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'

const props = defineProps<{ initialContent: string }>()

const editor = useEditor({
  editable: false,
  extensions: [StarterKit, Underline],
  content: props.initialContent || '',
})

watch(() => props.initialContent, (val) => {
  if (editor.value && val)
    editor.value.commands.setContent(val)
})

onBeforeUnmount(() => editor.value?.destroy())
</script>

<template>
  <div class="editor editor-squished">
    <EditorContent class="editor__content" :editor="editor" />
  </div>
</template>
