import { Node } from '@tiptap/core'

export const Subtitle = Node.create({
  name: 'subtitle',

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      { tag: 'h2' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['h2', { class: 'subtitle', ...HTMLAttributes }, 0]
  },
})
