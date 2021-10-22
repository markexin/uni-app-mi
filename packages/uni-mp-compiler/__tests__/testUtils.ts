import { isCustomElement, isNativeTag } from '@dcloudio/uni-shared'
import { compile } from '../src/index'
import { CompilerOptions } from '../src/options'

export const miniProgram = {
  slot: {
    fallback: false,
  },
  directive: 'wx:',
} as const

export function inspect(obj: any) {
  console.log(require('util').inspect(obj, { colors: true, depth: null }))
}

export function assert(
  template: string,
  templateCode: string,
  renderCode: string,
  options: CompilerOptions = {}
) {
  const res = compile(template, {
    mode: 'module',
    filename: 'foo.vue',
    prefixIdentifiers: true,
    inline: true,
    isNativeTag,
    isCustomElement,
    miniProgram: {
      slot: {
        fallback: false,
      },
      directive: 'wx:',
      emitFile({ source }) {
        // console.log(source)
        if (!options.onError) {
          expect(source).toBe(templateCode)
        }
        return ''
      },
    },
    ...options,
  })
  // expect(res.template).toBe(templateCode)
  // expect(res.code).toBe(renderCode)
  // console.log(require('util').inspect(res.code, { colors: true, depth: null }))
  // console.log(require('util').inspect(res, { colors: true, depth: null }))
  if (!options.onError) {
    expect(res.code).toBe(renderCode)
  }
}