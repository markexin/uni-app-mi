import Vue from 'vue'

import {
  initHooks,
  initMocks
} from 'uni-wrapper/util'

import EventChannel from 'uni-helpers/EventChannel'

import {
  getEventChannel
} from 'uni-helpers/navigate-to'

import {
  uniIdMixin
} from 'uni-shared'

const hooks = [
  'onShow',
  'onHide',
  'onError',
  'onPageNotFound',
  'onThemeChange',
  'onUnhandledRejection'
]

function initEventChannel () {
  Vue.prototype.getOpenerEventChannel = function () {
    // 微信小程序使用自身getOpenerEventChannel
    if (__PLATFORM__ === 'mp-weixin') {
      return this.$scope.getOpenerEventChannel()
    }
    if (!this.__eventChannel__) {
      this.__eventChannel__ = new EventChannel()
    }
    return this.__eventChannel__
  }
  const callHook = Vue.prototype.__call_hook
  Vue.prototype.__call_hook = function (hook, args) {
    if (hook === 'onLoad' && args && args.__id__) {
      this.__eventChannel__ = getEventChannel(args.__id__)
      delete args.__id__
    }
    return callHook.call(this, hook, args)
  }
}

function initScopedSlotsParams () {
  const center = {}
  const parents = {}

  Vue.prototype.$hasScopedSlotsParams = function (vueId) {
    const has = center[vueId]
    if (!has) {
      parents[vueId] = this
      this.$on('hook:destory', () => {
        delete parents[vueId]
      })
    }
    return has
  }

  Vue.prototype.$getScopedSlotsParams = function (vueId, name, key) {
    const data = center[vueId]
    if (data) {
      const object = data[name] || {}
      return key ? object[key] : object
    } else {
      parents[vueId] = this
      this.$on('hook:destory', () => {
        delete parents[vueId]
      })
    }
  }

  Vue.prototype.$setScopedSlotsParams = function (name, value) {
    const vueId = this.$options.propsData.vueId
    const object = center[vueId] = center[vueId] || {}
    object[name] = value
    if (parents[vueId]) {
      parents[vueId].$forceUpdate()
    }
  }

  Vue.mixin({
    destroyed () {
      const propsData = this.$options.propsData
      const vueId = propsData && propsData.vueId
      if (vueId) {
        delete center[vueId]
        delete parents[vueId]
      }
    }
  })
}

export default function parseBaseApp (vm, {
  mocks,
  initRefs
}) {
  initEventChannel()
  if (__PLATFORM__ === 'mp-weixin' || __PLATFORM__ === 'mp-qq' || __PLATFORM__ === 'mp-toutiao' || __PLATFORM__ === 'mp-kuaishou' || __PLATFORM__ === 'mp-alipay' || __PLATFORM__ === 'mp-baidu') {
    initScopedSlotsParams()
  }
  if (vm.$options.store) {
    Vue.prototype.$store = vm.$options.store
  }
  uniIdMixin(Vue)

  Vue.prototype.mpHost = __PLATFORM__

  Vue.mixin({
    beforeCreate () {
      if (!this.$options.mpType) {
        return
      }

      this.mpType = this.$options.mpType

      this.$mp = {
        data: {},
        [this.mpType]: this.$options.mpInstance
      }

      this.$scope = this.$options.mpInstance

      delete this.$options.mpType
      delete this.$options.mpInstance
      if (this.mpType === 'page' && typeof getApp === 'function') { // hack vue-i18n
        const app = getApp()
        if (app.$vm && app.$vm.$i18n) {
          this._i18n = app.$vm.$i18n
        }
      }
      if (this.mpType !== 'app') {
        initRefs(this)
        initMocks(this, mocks)
      }
    }
  })

  const appOptions = {
    onLaunch (args) {
      if (this.$vm) { // 已经初始化过了，主要是为了百度，百度 onShow 在 onLaunch 之前
        return
      }
      if (__PLATFORM__ === 'mp-weixin' || __PLATFORM__ === 'mp-qq') {
        if (wx.canIUse && !wx.canIUse('nextTick')) { // 事实 上2.2.3 即可，简单使用 2.3.0 的 nextTick 判断
          console.error('当前微信基础库版本过低，请将 微信开发者工具-详情-项目设置-调试基础库版本 更换为`2.3.0`以上')
        }
      }

      this.$vm = vm

      this.$vm.$mp = {
        app: this
      }

      this.$vm.$scope = this
      // vm 上也挂载 globalData
      this.$vm.globalData = this.globalData

      this.$vm._isMounted = true
      this.$vm.__call_hook('mounted', args)

      this.$vm.__call_hook('onLaunch', args)
    }
  }

  // 兼容旧版本 globalData
  appOptions.globalData = vm.$options.globalData || {}
  // 将 methods 中的方法挂在 getApp() 中
  const methods = vm.$options.methods
  if (methods) {
    Object.keys(methods).forEach(name => {
      appOptions[name] = methods[name]
    })
  }

  initHooks(appOptions, hooks)

  return appOptions
}