import { acceptHMRUpdate, defineStore } from 'pinia'

export const useAuthenticationStore = defineStore('authentication', () => {
  const { loggedIn, user, session, fetch, clear, openInPopup } = useUserSession()

  // const user = ref<Record<string, any> | null>(null)

  const authUser = computed(() => user.value ?? null)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => (user.value as Record<string, any>)?.role === 'admin')

  async function login(loginData: Record<string, any>) {
    await $fetch<Record<string, any>>('/api/auth/login', { method: 'POST', body: loginData })

    return user.value
  }

  async function resetPassword(resetData: Record<string, any>) {
    return $fetch('/api/auth/resetPassword', { method: 'POST', body: resetData })
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
  }

  async function register(registerData: Record<string, any>) {
    try {
      return await $fetch('/api/auth/register', { method: 'POST', body: registerData })
    }
    catch (error: any) {
      const message = error?.data?.errors?.message ?? 'Uuuups, something went wrong. Please try register again!'
      throw new Error(message)
    }
  }

  async function getAuthUser() {
    if (user.value)
      return user.value
    try {
      const result = await $fetch<Record<string, any>>('/api/users/me')
      user.value = result
      return user.value
    }
    catch (error) {
      user.value = null
      throw error
    }
  }

  return { user, authUser, isAuthenticated, isAdmin, login, resetPassword, logout, register, getAuthUser }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuthenticationStore, import.meta.hot))
