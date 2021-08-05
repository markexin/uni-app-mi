import type { Plugin } from 'vite'
import type { ParserOptions } from '@vue/compiler-core'
import type { CompilerOptions } from '@vue/compiler-sfc'
import type { Target } from 'rollup-plugin-copy'
export interface CopyOptions {
  /**
   * 静态资源，配置的目录，在 uni_modules 中同样支持
   */
  assets?: string[]
  targets?: readonly Target[]
}
export interface UniVitePlugin extends Plugin {
  uni?: {
    compilerOptions?: {
      isNativeTag: ParserOptions['isNativeTag']
      isCustomElement: ParserOptions['isCustomElement']
      directiveTransforms?: CompilerOptions['directiveTransforms']
    }
    transformEvent?: Record<string, string>
    copyOptions?: CopyOptions | (() => CopyOptions)
  }
}

export * from './utils'
export * from './plugins'
export * from './features'