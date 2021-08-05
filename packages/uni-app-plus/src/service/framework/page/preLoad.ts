import { ComponentPublicInstance } from 'vue'
import { createWebview } from '../webview'

export interface PreloadWebviewObject extends PlusWebviewWebviewObject {
  __preload__?: boolean
  __query__?: string
  __page__?: ComponentPublicInstance
}

export const preloadWebviews: Record<string, PreloadWebviewObject> = {}

export function removePreloadWebview(webview: PreloadWebviewObject) {
  const url = Object.keys(preloadWebviews).find(
    (url) => preloadWebviews[url].id === webview.id
  )
  if (url) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[uni-app] removePreloadWebview(${webview.id})`)
    }
    delete preloadWebviews[url]
  }
}

export function closePreloadWebview({ url }: { url: string }) {
  const webview = preloadWebviews[url]
  if (webview) {
    if (webview.__page__) {
      if (!getCurrentPages().find((page) => page === webview.__page__)) {
        // 未使用
        webview.close('none')
      } else {
        // 被使用
        webview.__preload__ = false
      }
    } else {
      // 未使用
      webview.close('none')
    }
    delete preloadWebviews[url]
  }
  return webview
}

export function preloadWebview({
  url,
  path,
  query,
}: {
  url: string
  path: string
  query: Record<string, string>
}) {
  if (!preloadWebviews[url]) {
    const routeOptions: UniApp.UniRoute = JSON.parse(
      JSON.stringify(__uniRoutes.find((route) => route.path === path))
    )
    preloadWebviews[url] = createWebview({
      path,
      routeOptions,
      query,
      webviewStyle: {
        __preload__: true,
        __query__: JSON.stringify(query),
      },
    })
  }
  return preloadWebviews[url]
}