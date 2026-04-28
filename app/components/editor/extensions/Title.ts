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

export const TitleNode = Node.create({
  name: 'title',
  group: 'block',
  content: 'inline*',
  defining: true,
  parseHTML() {
    return [{ tag: 'h1[data-type="title" class="title"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['h1', { 'data-type': 'title', ...HTMLAttributes, class: 'title' }, 0]
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { state, dispatch } = this.editor.view
        const { selection } = state
        const node = selection.$anchor.node()
        if (node.type === this.type) {
          return this.editor.commands.insertContentAt(
            selection.anchor,
            { type: 'subtitle' }
          )
        }
        return false
      }
    }
  }
})