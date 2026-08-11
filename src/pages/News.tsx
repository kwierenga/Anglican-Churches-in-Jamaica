import { useEffect, useState } from 'react'
import { feedLink } from '../lib/feed'
import Badge, { categoryTone } from '../components/Badge'
import type { FeedItem } from '../lib/schemas'

const today = new Date().toISOString().slice(0, 10)

interface FeedMeta {
  checkedAt: string
  sources: { name: string; ok: boolean; items: number; note?: string }[]
}

export default function News() {
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [meta, setMeta] = useState<FeedMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'events' | 'news' | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/feed.json`)
      .then(r => r.ok ? r.json() : [])
      .then(setFeed)
      .catch(() => setFeed([]))
      .finally(() => setLoading(false))
    fetch(`${import.meta.env.BASE_URL}data/feed-meta.json`)
      .then(r => r.ok ? r.json() : null)
      .then(setMeta)
      .catch(() => setMeta(null))
  }, [])

  const events = feed.filter(i => i.date > today)
  const news = feed.filter(i => i.date <= today)

  // Open on a tab that has something in it. The page used to default to
  // Events and greet most visitors with "No upcoming events" — the diocesan
  // calendar is often empty while the news list is not.
  const activeTab = tab ?? (events.length > 0 ? 'events' : 'news')
  const items = activeTab === 'events' ? events : news

  const staleDays = meta?.checkedAt
    ? Math.floor((Date.now() - new Date(meta.checkedAt).getTime()) / 86_400_000)
    : null
  const failing = meta?.sources?.filter(s => !s.ok) ?? []

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-heading text-3xl font-bold text-crimson mb-2">News &amp; Events</h1>
      <p className="text-sm text-gray-500 mb-3 font-body">
        Events and news from the Diocese of Jamaica and the Cayman Islands.{' '}
        <a href="https://www.anglicandioceseja.org/news" target="_blank" rel="noopener noreferrer"
           className="text-crimson underline">Full archive at anglicandioceseja.org</a>
      </p>

      {/* Say how fresh this is. An un-refreshed feed used to look identical to a
          current one, which is worse than an honest "last checked" line. */}
      {meta?.checkedAt && (
        <p className="text-xs text-gray-500 mb-6 font-body">
          Sources last checked{' '}
          <time dateTime={meta.checkedAt}>
            {new Date(meta.checkedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </time>
          {staleDays != null && staleDays > 14 && (
            <span className="text-crimson-mid"> — {staleDays} days ago; the feed may be out of date.</span>
          )}
          {failing.length > 0 && (
            <span className="text-crimson-mid"> {failing.map(s => s.name).join(', ')} could not be reached on the last run.</span>
          )}
        </p>
      )}

      {/* Tabs — the Events tab is hidden entirely when the calendar is empty. */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {events.length > 0 && (
          <button
            onClick={() => setTab('events')}
            className={`px-4 py-2 text-sm font-body font-semibold border-b-2 -mb-px transition-colors
              ${activeTab === 'events' ? 'border-gold-deep text-gold-deep' : 'border-transparent text-gray-500 hover:text-crimson'}`}
          >
            Upcoming Events ({events.length})
          </button>
        )}
        <button
          onClick={() => setTab('news')}
          className={`px-4 py-2 text-sm font-body font-semibold border-b-2 -mb-px transition-colors
            ${activeTab === 'news' ? 'border-crimson text-crimson' : 'border-transparent text-gray-500 hover:text-crimson'}`}
        >
          Recent News ({news.length})
        </button>
      </div>

      {loading && <p className="text-gray-500 font-body">Loading...</p>}

      {!loading && items.length === 0 && (
        <p className="text-gray-500 font-body">
          {activeTab === 'events' ? 'No upcoming events.' : 'No recent news items.'} Check back soon.
        </p>
      )}

      <div className="space-y-4">
        {items.map(item => {
          const link = feedLink(item)
          const Card = link ? 'a' : 'div'
          const cardProps = link
            ? link.external
              ? { href: link.href, target: '_blank' as const, rel: 'noopener noreferrer' }
              : { href: link.href }
            : {}
          return (
            <Card key={item.id} {...cardProps}
                  className={`block border rounded-lg p-5 transition-shadow
                    ${link ? 'hover:shadow-md hover:border-crimson/40 cursor-pointer' : ''}
                    ${activeTab === 'events' ? 'border-l-4 border-l-gold' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <Badge tone={activeTab === 'events' ? 'event' : categoryTone(item.category)}>
                  {activeTab === 'events' ? 'upcoming' : item.category}
                </Badge>
                {item.parish && <span className="text-xs text-gray-500 italic">{item.parish}</span>}
                <span className="text-xs text-gray-500 ml-auto">
                  {new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h2 className="font-heading text-lg font-semibold text-gray-900 mt-2 mb-1">{item.title}</h2>
              {item.report ? (
                <>
                  <p className="font-body text-sm text-gray-600 whitespace-pre-line">{item.report}</p>
                  <p className="text-xs text-crimson-mid mt-2 font-semibold">Post-event report</p>
                </>
              ) : (
                <p className="font-body text-sm text-gray-600">{item.summary}</p>
              )}
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                <span>{item.source}</span>
                {link && (
                  <span className="text-crimson ml-auto">{link.label} &rarr;</span>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
