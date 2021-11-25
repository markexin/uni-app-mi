// import { inspect } from './testUtils'

import { compile } from '../src/index'
import { CompilerOptions } from '../src/options'
import { miniProgram } from './testUtils'

function assert(
  template: string,
  templateCode: string,
  renderCode: string,
  options: CompilerOptions = {}
) {
  const res = compile(template, {
    filename: 'foo.vue',
    prefixIdentifiers: true,
    inline: true,
    generatorOpts: {
      concise: true,
    },
    miniProgram: {
      ...miniProgram,
      emitFile({ source }) {
        console.log(source)
        return ''
      },
    },
    ...options,
  })
  console.log(res.code)
  if (res.code === renderCode) {
    console.log('success')
  } else {
    console.error('error')
    console.error(renderCode)
  }
}

assert(
  `<view v-for="item in items"><uni-icons v-if="ok"/><uni-icons v-else :title="item.title"/></view>`,
  `<slot wx:for="{{a}}" wx:for-item="item"></slot>`,
  `(_ctx, _cache) => {
return { a: _f(_ctx.items, (item, index, i0) => { return { a: _r(\"default\", { key: index }) }; }) }
}`
)