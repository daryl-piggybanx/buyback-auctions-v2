import { createFileRoute } from '@tanstack/react-router'
import { AuctionRequestsView } from '~/components/dashboard/AuctionRequestsView'
import { AuthRequired } from '~/components/auth/AuthRequired'

export const Route = createFileRoute('/requests/')({
  component: RequestsPage,
})

function RequestsPage() {
  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <AuthRequired>
        <AuctionRequestsView />
      </AuthRequired>
    </div>
  )
}
