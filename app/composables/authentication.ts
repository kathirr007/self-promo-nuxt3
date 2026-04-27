import type { User } from '~~/server/models/types/user'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useAuthenticationStore = defineStore('authentication', () => {
  const { loggedIn, user, session, fetch: fetchUserSession, clear: clearUserSession, openInPopup } = useUserSession()

  // const user = ref<Record<string, any> | null>(null)

  const authUser = computed(() => user.value ?? null)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => (user.value as Record<string, any>)?.role === 'admin')

  async function login(loginData: Record<string, any>) {
    await $fetch<Record<string, any>>('/api/auth/login', { method: 'POST', body: loginData })
    await fetchUserSession()
    push.success({
      title: 'Login',
      message: `Welcome Back ${(user.value as User)?.name}...!`,
    })
    return user.value
  }

  async function resetPassword(resetData: Record<string, any>) {
    return $fetch('/api/auth/resetPassword', { method: 'POST', body: resetData })
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await clearUserSession()
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

  return { user, loggedIn, session, authUser, isAuthenticated, isAdmin, login, resetPassword, logout, register, fetch: fetchUserSession, clear: clearUserSession, openInPopup }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuthenticationStore, import.meta.hot))
