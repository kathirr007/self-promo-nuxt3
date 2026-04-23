import { defineNuxtPlugin } from '#app'

interface ToastOptions {
  duration?: number
  type?: 'success' | 'error' | 'info' | 'warning'
}

function createContainer() {
  let container = document.getElementById('nuxt-toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'nuxt-toast-container'
    container.style.position = 'fixed'
    container.style.top = '1rem'
    container.style.right = '1rem'
    container.style.zIndex = '9999'
    container.style.display = 'flex'
    container.style.flexDirection = 'column'
    container.style.gap = '0.5rem'
    document.body.appendChild(container)
  }
  return container
}

function createToast(message: string, options: ToastOptions = {}) {
  if (import.meta.server)
    return
  const container = createContainer()
  const toast = document.createElement('div')
  const duration = options.duration ?? 3000
  const type = options.type ?? 'info'

  toast.textContent = message
  toast.style.minWidth = '220px'
  toast.style.padding = '0.75rem 1rem'
  toast.style.borderRadius = '0.5rem'
  toast.style.color = '#ffffff'
  toast.style.boxShadow = '0 10px 25px rgba(15, 23, 42, 0.12)'
  toast.style.opacity = '0'
  toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease'
  toast.style.transform = 'translateY(-10px)'

  switch (type) {
    case 'success':
      toast.style.background = '#38a169'
      break
    case 'error':
      toast.style.background = '#e53e3e'
      break
    case 'warning':
      toast.style.background = '#dd6b20'
      break
    default:
      toast.style.background = '#2b6cb0'
      break
  }

  container.appendChild(toast)

  requestAnimationFrame(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateY(0)'
  })

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateY(-10px)'
    setTimeout(() => {
      toast.remove()
    }, 200)
  }, duration)
}

export default defineNuxtPlugin((nuxtApp) => {
  const toast = (message: string, options: ToastOptions = {}) => createToast(message, options)
  nuxtApp.provide('toasted', { show: toast, success: (msg: string, options?: ToastOptions) => toast(msg, { ...options, type: 'success' }), error: (msg: string, options?: ToastOptions) => toast(msg, { ...options, type: 'error' }), info: (msg: string, options?: ToastOptions) => toast(msg, { ...options, type: 'info' }), warning: (msg: string, options?: ToastOptions) => toast(msg, { ...options, type: 'warning' }) })
  nuxtApp.vueApp.config.globalProperties.$toasted = { show: toast, success: (msg: string, options?: ToastOptions) => toast(msg, { ...options, type: 'success' }), error: (msg: string, options?: ToastOptions) => toast(msg, { ...options, type: 'error' }), info: (msg: string, options?: ToastOptions) => toast(msg, { ...options, type: 'info' }), warning: (msg: string, options?: ToastOptions) => toast(msg, { ...options, type: 'warning' }) }
})
