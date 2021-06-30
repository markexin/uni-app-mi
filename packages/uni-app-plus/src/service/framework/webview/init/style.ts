import { parseWebviewStyle } from '../style'
import { initUniPageUrl, initDebugRefresh } from '../utils'

export function initWebviewStyle(
  webview: PlusWebviewWebviewObject,
  path: string,
  query: Record<string, any>,
  routeMeta: UniApp.PageRouteMeta
) {
  const webviewStyle = parseWebviewStyle(path, routeMeta)
  webviewStyle.uniPageUrl = initUniPageUrl(path, query)
  const isTabBar = !!routeMeta.isTabBar
  if (!routeMeta.isNVue) {
    webviewStyle.debugRefresh = initDebugRefresh(isTabBar, path, query)
  } else {
    // android 需要使用
    webviewStyle.isTab = isTabBar
  }
  if (__DEV__) {
    console.log('[uni-app] updateWebview', webviewStyle)
  }
  webview.setStyle(webviewStyle)
}
