import { useEffect, useState } from 'react'
import type { FeedItem } from '../lib/schemas'

const today = new Date().toISOString().slice(0, 10)

export default function News() {
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'events' | 'news'>('events')

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/feed.json`)
      .then(r => r.ok ? r.json() : [])
      .then(setFeed)
      .catch(() => setFeed([]))
      .finally(() => setLoading(false))
  }, [])

  const events = feed.filter(i => i.date > today)
  const news = feed.filter(i => i.date <= today)
  const items = tab === 'events' ? events : news

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-heading text-3xl font-bold text-crimson mb-2">News &amp; Events</h1>
      <p className="text-sm text-gray-500 mb-6 font-body">
        Events and news from the Diocese of Jamaica and the Cayman Islands.{' '}
        <a href="https://www.anglicandioceseja.org/news" target="_blank" rel="noopener noreferrer"
           className="text-crimson underline">Full archive at anglicandioceseja.org</a>
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab('events')}
          className={`px-4 py-2 text-sm font-body font-semibold border-b-2 -mb-px transition-colors
            ${tab === 'events' ? 'border-gold text-gold' : 'border-transparent text-gray-500 hover:text-crimson'}`}
        >
          Upcoming Events ({events.length})
        </button>
        <button
          onClick={() => setTab('news')}
          className={`px-4 py-2 text-sm font-body font-semibold border-b-2 -mb-px transition-colors
            ${tab === 'news' ? 'border-crimson text-crimson' : 'border-transparent text-gray-500 hover:text-crimson'}`}
        >
          Recent News ({news.length})
        </button>
      </div>

      {loading && <p className="text-gray-400 font-body">Loading...</p>}

      {!loading && items.length === 0 && (
        <p className="text-gray-500 font-body">
          {tab === 'events' ? 'No upcoming events.' : 'No recent news items.'} Check back soon.
        </p>
      )}

      <div className="space-y-4">
        {items.map(item => {
          const href = item.url || 'https://www.anglicandioceseja.org/news'
          return (
            <a key={item.id} href={href} target="_blank" rel="noopener noreferrer"
               className={`block border rounded-lg p-5 transition-shadow hover:shadow-md hover:border-crimson/40 cursor-pointer
                 ${tab === 'events' ? 'border-l-4 border-l-gold' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded
                  ${tab === 'events' ? 'bg-gold text-white'
                  : item.category === 'diocese' ? 'bg-navy text-white'
                  : item.category === 'parish' ? 'bg-crimson text-white'
                  : item.category === 'clergy' ? 'bg-green-800 text-white'
                  : 'bg-gray-500 text-white'}`}>
                  {item.category}
                </span>
                {item.parish && <span className="text-xs text-gray-500 italic">{item.parish}</span>}
                <span className="text-xs text-gray-400 ml-auto">
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
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                <span>{item.source}</span>
                <span className="text-crimson ml-auto">
                  {item.url ? 'Read full article' : 'See Diocese news site'} &rarr;
                </span>
              </div>
            </a>
          )
        })}
      </div>
    </main>
  )
}
