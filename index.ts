import { VFile } from 'vfile'
import { Node } from 'unist'
import { Parent, Literal, List, ListItem,  Paragraph, Link } from 'mdast'
import toc from 'mdast-util-toc'

function assert(f: () => boolean, msg?: string) {
  if (!f()) {
    throw new Error(`assertion failed: ${msg}`)
  }
}

function assertChildrenLength(v: Parent, n: number) {
  assert(() => v.children.length === n, `children.length: want ${n}, got ${v.children.length}`)
}

function assertType(v: Node, typ: string) {
  assert(() => v.type === typ, `type: want ${typ}, got ${v.type}`)
}

export type Toc = TocEntry[]

export interface TocEntry {
  depth: number
  href: string
  value: string
  children?: Toc
}

export default function remarkStoreMetadataToc() {
  function paragraphToTocEntry(v: Paragraph, depth: number): TocEntry {
    assertChildrenLength(v, 1)
    const link = v.children[0] as Link
    assertChildrenLength(link, 1)
    const text = link.children[0] as Literal
    return {
      depth,
      href: link['url'] as string,
      value: text.value,
    }
  }

  function listToToc(list: List, depth: number): Toc {
    assertType(list, 'list')
    const listItems = list.children as ListItem[]
    return listItems.map((listItem: ListItem): TocEntry => {
      assertType(listItem, 'listItem')
      assert(() => listItem.children.length > 0)
      assert(() => listItem.children.length <= 2)

      if (listItem.children.length === 1 && listItem.children[0].type === 'list') {
        return {
          depth,
          href: '',
          value: '',
          children: listToToc(listItem.children[0] as List, depth + 1),
        }
      }

      assertType(listItem.children[0], 'paragraph')
      const entry = paragraphToTocEntry(listItem.children[0] as Paragraph, depth)
      if (listItem.children.length == 2) {
        entry.children = listToToc(listItem.children[1] as List, depth + 1)
      }
      return entry
    })
  }

  return (node: Node, vfile: VFile) => {
    const tocNode = toc(node).map
    if (tocNode === null) {
      vfile.data.toc = []
    } else {
      vfile.data.toc = listToToc(tocNode, 1)
    }
  }
}
