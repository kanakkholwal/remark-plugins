import { Plugin } from 'unified'
import { Node } from 'unist'
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'
import slugify from 'slugify'

interface HeadingNode extends Node {
  type: 'heading'
  depth: number
  children: Array<Node>
  data?: {
    id?: string
    hProperties?: {
      id?: string
    }
  }
}

const remarkSlugifyHeadings: Plugin = () => {
  return (tree: Node) => {
    visit(tree, 'heading', (node: HeadingNode) => {
      const textContent = toString(node)
      const slug = slugify(textContent, { lower: true, strict: true })

      if (!node.data) {
        node.data = {}
      }
      if (!node.data.hProperties) {
        node.data.hProperties = {}
      }

      node.data.id = slug
      node.data.hProperties.id = slug
    })
  }
}

export default remarkSlugifyHeadings