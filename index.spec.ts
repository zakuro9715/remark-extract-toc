import { unified } from 'unified'
import parse from 'remark-parse'
import stringify from 'remark-stringify'
import extractToc from '.'

const title = (...idxes: Array<number|null>) =>
  idxes.map((v) => (v || '_')).join('-')

test('title', () => {
  expect(title(1, 1, 1)).toBe('1-1-1')
  expect(title(1, null, 1)).toBe('1-_-1')
})

const source = `
# ${title(1)}

## ${title(1, 1)}

### ${title(1, 1, 1)}

# ${title(2)}

### ${title(2, null, 1)}

#### ${title(2, null, 1, 1)}
`

test('plain md', () => {
  const md = unified()
    .use(parse, {})
    .use(extractToc)
    .use(stringify)

  md.process(source)
})
