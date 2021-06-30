import { ON_WEBVIEW_READY } from '../../../../constants'
import { onPlusMessage } from '../initGlobalEvent'
import { subscribeWebviewReady } from './webviewReady'

export function initSubscribeHandlers() {
  const { subscribe, subscribeHandler } = UniServiceJSBridge

  onPlusMessage<{ type: string; data: Record<string, any>; pageId: number }>(
    'subscribeHandler',
    ({ type, data, pageId }) => {
      subscribeHandler(type, data, pageId)
    }
  )

  if (__uniConfig.renderer !== 'native') {
    // 非纯原生
    subscribe(ON_WEBVIEW_READY, subscribeWebviewReady)
  }
}
