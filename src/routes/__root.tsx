import { createRootRoute, Outlet } from '@tanstack/react-router'
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Toaster } from "sonner";
import { Header } from '~/components/Header'
import { ProfileManager } from '~/components/profile/ProfileManager'
import { useNotifications } from '~/hooks/useNotifications'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ConvexProvider client={convex}>
      <ConvexAuthProvider client={convex}>
        <ProfileManager>
          <AppContent />
        </ProfileManager>
      </ConvexAuthProvider>
    </ConvexProvider>
  )
}

function AppContent() {
  // Initialize notifications to show toasts
  useNotifications();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Toaster position="top-center" />
    </div>
  )
}
