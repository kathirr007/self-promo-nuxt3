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

export // Custom Subtitle node
const SubtitleNode = Node.create({
  name: 'subtitle',
  group: 'block',
  content: 'inline*',
  defining: true,
  parseHTML() {
    return [{ tag: 'h2[data-type="subtitle" class="subtitle"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['h2', { 'data-type': 'subtitle', ...HTMLAttributes, class: 'subtitle' }, 0]
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { state } = this.editor.view
        const { selection } = state
        const node = selection.$anchor.node()
        if (node.type === this.type) {
          return this.editor.commands.insertContentAt(
            selection.anchor,
            { type: 'paragraph' }
          )
        }
        return false
      }
    }
  }
})
