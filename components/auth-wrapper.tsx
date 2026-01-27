"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const auth = sessionStorage.getItem("alamia_auth")

    if (pathname === "/login") {
      // If already authenticated and on login page, redirect to dashboard
      if (auth === "authenticated") {
        router.push("/")
      } else {
        setIsLoading(false)
      }
    } else {
      // For all other pages, check authentication
      if (auth !== "authenticated") {
        router.push("/login")
      } else {
        setIsAuthenticated(true)
        setIsLoading(false)
      }
    }
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (pathname === "/login" || isAuthenticated) {
    return <>{children}</>
  }

  return null
}
