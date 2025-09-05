import { createFileRoute } from '@tanstack/react-router'
import { CreateAuctionRequestForm } from '../components/CreateAuctionRequestForm'
import { AuthRequired } from '../components/AuthRequired'

export const Route = createFileRoute('/request-auction')({
  component: RequestAuctionPage,
})

function RequestAuctionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <AuthRequired>
        <CreateAuctionRequestForm />
      </AuthRequired>
    </div>
  )
}
