import { createFileRoute } from '@tanstack/react-router'
import { CreateAuctionRequestForm } from '~/components/auction/CreateAuctionRequestForm'
import { AuthRequired } from '~/components/auth/AuthRequired'

export const Route = createFileRoute('/request-auction')({
  component: RequestAuctionPage,
})

function RequestAuctionPage() {
  return (
    <div className="px-4 py-8 mx-auto max-w-4xl">
      <AuthRequired>
        <CreateAuctionRequestForm />
      </AuthRequired>
    </div>
  )
}
