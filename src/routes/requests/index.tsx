import { createFileRoute } from '@tanstack/react-router'
import { AuctionRequestsView } from '../../components/AuctionRequestsView'
import { AuthRequired } from '../../components/AuthRequired'

export const Route = createFileRoute('/requests/')({
  component: RequestsPage,
})

function RequestsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AuthRequired>
        <AuctionRequestsView />
      </AuthRequired>
    </div>
  )
}
