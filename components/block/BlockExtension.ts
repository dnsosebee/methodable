// TODO: DELETE THIS FILE

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import Block from './Block'

export default Node.create({
  name: 'blockEditor',

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'block-component',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['block-component', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(Block)
  },
})