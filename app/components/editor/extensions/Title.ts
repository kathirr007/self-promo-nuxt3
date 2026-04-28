import { Node } from '@tiptap/core'

export const Title = Node.create({
  name: 'title',

  group: 'block',

  content: 'inline*',

  // Add empty text node as default content
  addAttributes() {
    return {}
  },

  parseHTML() {
    return [
      { tag: 'h1' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['h1', { class: 'title', ...HTMLAttributes }, 0]
  },
})