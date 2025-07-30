import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Bell, User, Lock } from "lucide-react"
import AccountForm from "@/app/(sidebar-layout)/settings/account-form"
import PrivacySettings from "@/app/(sidebar-layout)/settings/privacy-settings"
import ChangePassword from "@/app/(sidebar-layout)/settings/change-password"
import Notification from "@/app/(sidebar-layout)/settings/notification"
import { TwoFactorAuth } from "@/components/2fa"
import Preferences from "@/app/(sidebar-layout)/settings/preferences"
import Security from "./security"

export default function SettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <AccountForm />
          <ChangePassword />
          <Preferences />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <PrivacySettings />
          <TwoFactorAuth />
          <Security />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Notification />
        </TabsContent>
      </Tabs>
    </>
  )
}
