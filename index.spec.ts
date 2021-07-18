import { unified } from 'unified'
import parse from 'remark-parse'
import stringify from 'remark-stringify'
import storeToc from '.'

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

const expected = [
  {
    depth: 1,
    value: title(1),
    url: '#' + title(1),
    children: [
      {
        depth: 2,
        value: title(1, 1),
        url: '#' + title(1, 1),
        children: [
          {
            depth: 3,
            value: title(1, 1, 1),
            url: '#' + title(1, 1, 1),
          }
        ],
      }
    ],
  },
  {
    depth: 1,
    value: title(2),
    url: '#' + title(2),
    children: [
      {
        depth: 2,
        value: '',
        url: '',
        children: [
          {
            depth: 3,
            value: title(2, null, 1),
            url: '#' + title(2, null, 1),
            children: [
              {
                depth: 4,
                value: title(2, null, 1, 1),
                url: '#' + title(2, null, 1, 1),
              },
            ],
          },
        ],
      },
    ],
  },
]

test('plain md', async () => {
  const md = unified()
    .use(parse, {})
    .use(storeToc)
    .use(stringify)

  const { data } = await md.process(source)
  expect(data.toc).toStrictEqual(expected)
})
