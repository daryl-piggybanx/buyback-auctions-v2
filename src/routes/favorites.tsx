import { createFileRoute } from '@tanstack/react-router'
import { FavoritesView } from '../components/FavoritesView'
import { AuthRequired } from '../components/AuthRequired'

export const Route = createFileRoute('/favorites')({
  component: FavoritesPage,
})

function FavoritesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AuthRequired>
        <FavoritesView />
      </AuthRequired>
    </div>
  )
}
