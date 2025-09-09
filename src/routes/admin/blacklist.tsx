import { createFileRoute } from '@tanstack/react-router'
import { AuthRequired } from '~/components/auth/AuthRequired'
import { api } from '~/convex/_generated/api'
import { useQuery, useMutation } from 'convex/react'
import { useState } from 'react'
import UserTable from '~/components/table/user'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Doc, Id } from '~/convex/_generated/dataModel'

// Use proper Convex types
type BlacklistEntry = Doc<"blacklist"> & {
  user?: Doc<"users"> | null;
  profile?: Doc<"userProfiles"> | null;
};

export const Route = createFileRoute('/admin/blacklist')({
  component: RouteComponent,
})

function RouteComponent() {
  const blacklist = useQuery(api.users.getBlacklist) as BlacklistEntry[] | undefined
  const addToBlacklist = useMutation(api.users.addToBlacklist)
  const removeFromBlacklist = useMutation(api.users.removeFromBlacklist)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')

  const handleAddToBlacklist = async () => {
    if (!email || !reason) return
    
    try {
      await addToBlacklist({ email, reason })
      setEmail('')
      setReason('')
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Failed to add to blacklist:', error)
    }
  }

  const handleRemoveFromBlacklist = async (entryId: string) => {
    try {
      await removeFromBlacklist({ entryId: entryId as Id<"blacklist"> })
    } catch (error) {
      console.error('Failed to remove from blacklist:', error)
    }
  }

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <AuthRequired>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Blacklist Management</h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add to Blacklist</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add User to Blacklist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Reason for blacklisting"
                    />
                  </div>
                  <Button onClick={handleAddToBlacklist} className="w-full">
                    Add to Blacklist
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {blacklist ? (
            <UserTable 
              data={blacklist} 
              type="blacklist"
              onRemoveFromBlacklist={handleRemoveFromBlacklist}
            />
          ) : (
            <div>Loading blacklist...</div>
          )}
        </div>
      </AuthRequired>
    </div>
  )
}
