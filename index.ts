import { Node } from 'unist'
import { toc } from 'mdast-util-toc'

export default function remarkStoreMetadataToc() {
  return (node: Node) => {
    const tocNode = toc(node)
    console.log(JSON.stringify(tocNode, null, 2))
  }
}
