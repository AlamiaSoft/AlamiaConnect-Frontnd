"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "@/components/theme-provider"
import {
  User,
  Mail,
  Phone,
  Palette,
  Monitor,
  Upload,
  FileText,
  DollarSign,
  MapPin,
  Sun,
  Moon,
  Laptop,
  Lock,
  Target,
  Pipette,
} from "lucide-react"

export function ProfileSettings() {
  const { theme, setTheme } = useTheme()
  const [accentColor, setAccentColor] = useState("rgb(230, 33, 42)")
  const [customColor, setCustomColor] = useState("#e6212a")
  const profilePictureRef = useRef<HTMLInputElement>(null)
  const documentRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color)
    const root = document.documentElement

    // Convert hex or rgb to oklch for CSS variables
    const colorMap: { [key: string]: string } = {
      "rgb(230, 33, 42)": "oklch(0.55 0.22 25)", // KTD Red
      "#3b82f6": "oklch(0.55 0.18 250)", // Blue
      "#8b5cf6": "oklch(0.6 0.2 280)", // Purple
      "#10b981": "oklch(0.65 0.18 160)", // Green
      "#f97316": "oklch(0.68 0.2 40)", // Orange
      "#ec4899": "oklch(0.65 0.24 340)", // Pink
      "#14b8a6": "oklch(0.65 0.16 184)", // Teal
    }

    const oklchColor = colorMap[color]
    if (oklchColor) {
      root.style.setProperty("--color-primary", oklchColor)
      root.style.setProperty("--color-ring", oklchColor)
      root.style.setProperty("--color-sidebar-primary", oklchColor)
      root.style.setProperty("--color-sidebar-ring", oklchColor)
    }
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setCustomColor(color)
    setAccentColor(color)

    // Convert hex to approximate oklch (simplified conversion)
    const root = document.documentElement
    root.style.setProperty("--color-primary", color)
    root.style.setProperty("--color-ring", color)
    root.style.setProperty("--color-sidebar-primary", color)
    root.style.setProperty("--color-sidebar-ring", color)
  }

  const handleProfilePictureClick = () => {
    profilePictureRef.current?.click()
  }

  const handleDocumentClick = (docId: string) => {
    documentRefs.current[docId]?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log(`[Alamia] File selected for ${type}:`, file.name)
    }
  }

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ]

  const accentColors = [
    { name: "KTD Red", value: "rgb(230, 33, 42)" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Green", value: "#10b981" },
    { name: "Orange", value: "#f97316" },
    { name: "Pink", value: "#ec4899" },
    { name: "Teal", value: "#14b8a6" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your account and customize your experience</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Picture & Password
            </CardTitle>
            <CardDescription>Update your profile picture and change your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                <AvatarFallback className="text-2xl">MA</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <input
                  ref={profilePictureRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "profile-picture")}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={handleProfilePictureClick}
                >
                  <Upload className="h-4 w-4" />
                  Upload Picture
                </Button>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>
            <Separator />
            <Button variant="outline" className="gap-2 bg-transparent">
              <Lock className="h-4 w-4" />
              Change Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal & Professional Information
            </CardTitle>
            <CardDescription>Complete your personal and work details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" placeholder="ENGINEER" defaultValue="ENGINEER" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherName">Father's Name</Label>
                <Input id="fatherName" placeholder="Father's full name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" placeholder="Engineer" defaultValue="Engineer" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@ktd.com"
                    className="pl-10"
                    defaultValue="mali@ktd.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="officialNumber">Official Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="officialNumber" placeholder="+92 300 1234567" className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kinshipNumber">Kinship Number (Emergency)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="kinshipNumber" placeholder="+92 300 1234567" className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="basicSalary">Basic Salary</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="basicSalary" type="number" placeholder="50000" className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyTarget">Monthly Target</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="monthlyTarget" type="number" placeholder="100000" className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalSalary">Total Salary (Calculated)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="totalSalary"
                    type="number"
                    placeholder="65000"
                    className="pl-10 bg-muted"
                    disabled
                    defaultValue="65000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="homeLocation">Home Google Pin Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="homeLocation" placeholder="Google Maps URL" className="pl-10" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Full address" rows={3} />
            </div>

            <Button className="w-full">Save Profile Information</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
            <CardDescription>Upload required documents for verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { id: "cnic", label: "CNIC" },
                { id: "fatherCnic", label: "Father's CNIC" },
                { id: "police", label: "Police Character Certificate" },
                { id: "education", label: "Education Certificates" },
                { id: "resume", label: "Resume" },
                { id: "appointment", label: "Appointment Letter" },
              ].map((doc) => (
                <div key={doc.id} className="space-y-2">
                  <Label htmlFor={doc.id}>{doc.label}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={(el) => { documentRefs.current[doc.id] = el }}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, doc.id)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 bg-transparent"
                      onClick={() => handleDocumentClick(doc.id)}
                    >
                      <Upload className="h-4 w-4" />
                      Upload {doc.label}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full">Save Documents</Button>
          </CardContent>
        </Card>

        {/* UI Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              UI Customization
            </CardTitle>
            <CardDescription>Personalize your interface appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Theme Mode
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <Button
                      key={option.value}
                      variant={theme === option.value ? "default" : "outline"}
                      onClick={() => setTheme(option.value as "light" | "dark" | "system")}
                      className="flex flex-col gap-2 h-auto py-4"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Accent Color */}
            <div className="space-y-3">
              <Label>Accent Color</Label>
              <div className="grid grid-cols-3 gap-3">
                {accentColors.map((color) => (
                  <Button
                    key={color.value}
                    variant={accentColor === color.value ? "default" : "outline"}
                    onClick={() => handleAccentColorChange(color.value)}
                    className="flex items-center gap-2 justify-start h-auto py-3"
                  >
                    <div
                      className="h-6 w-6 rounded-full border-2 border-border"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="text-sm">{color.name}</span>
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customColor" className="flex items-center gap-2">
                  <Pipette className="h-4 w-4" />
                  Custom Color
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="customColor"
                    value={customColor}
                    onChange={handleCustomColorChange}
                    className="h-10 w-20 rounded-md border border-input cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value)
                    }}
                    placeholder="#e6212a"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCustomColorChange({ target: { value: customColor } } as any)}
                  >
                    Apply
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Pick any color or enter a hex code</p>
              </div>
            </div>

            <Button className="w-full">Save Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
