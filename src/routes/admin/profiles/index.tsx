import { createFileRoute } from '@tanstack/react-router'
import { AuthRequired } from '~/components/auth/AuthRequired'
import { api } from '~/convex/_generated/api'
import { useQuery } from 'convex/react'
import ProfilesTable from '~/components/table/profiles'

export const Route = createFileRoute('/admin/profiles/')({
  component: RouteComponent,
})

function RouteComponent() {
  const profiles = useQuery(api.users.getAllProfiles)

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <AuthRequired>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Profile Management</h1>
          </div>
          
          {profiles ? (
            <ProfilesTable data={profiles} />
          ) : (
            <div>Loading profiles...</div>
          )}
        </div>
      </AuthRequired>
    </div>
  )
}
