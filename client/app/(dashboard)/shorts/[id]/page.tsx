import { ShortsPlayer } from '@/app/(dashboard)/shorts/[id]/short'
import { ShortsSkeleton } from '@/components/shorts-skeleton'
import { Suspense } from 'react'

export default async function ShortPage({
  params,
}: {
  params: { id: string }
}) {

  const { id } = await params

  return (
      <Suspense fallback={<ShortsSkeleton />}>
        <ShortsPlayer shortId={id} />
      </Suspense>
  )
}
