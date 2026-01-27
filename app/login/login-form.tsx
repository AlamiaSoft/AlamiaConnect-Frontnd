"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login, isAuthenticated, loading: authLoading } = useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            const returnUrl = searchParams.get('returnUrl') || '/'
            router.replace(returnUrl)
        }
    }, [isAuthenticated, authLoading, router, searchParams])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            await login({
                email,
                password,
                device_name: 'web-app'
            })

            // Redirect is handled by AuthContext
        } catch (err: any) {
            console.error('Login error:', err)
            setError(err.message || "Invalid email or password. Please try again.")
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <div className="mb-2 flex justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <span className="text-xl font-bold">AC</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Alamia Connect</CardTitle>
                    <CardDescription>Sign in to your account to continue</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@alamiaconnect.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>

                        {/* <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
                            <p className="font-medium text-foreground">Demo Credentials:</p>
                            <p className="text-muted-foreground">Email: demo@alamiaconnect.com</p>
                            <p className="text-muted-foreground">Password: 12345678</p>
                        </div> */}
                    </form>
                </CardContent>
            </Card>

            <div className="absolute bottom-4 text-center text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} AlamiaSoft. All rights reserved.</p>
            </div>
        </div>
    )
}
