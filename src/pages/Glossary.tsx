export default function Glossary() {
  const terms = [
    ['Emancipation', 'In Jamaica, Emancipation refers to the end of slavery in the British Empire, 1834\u20131838.'],
    ['Independence', 'Jamaica became an independent nation in 1962.'],
    ['Parish', 'An administrative area in Jamaica. There are 14 civil parishes, often used for church organization.'],
    ['Cathedral', 'The principal church of a diocese, containing the bishop\u2019s seat (cathedra).'],
    ['Church', 'A consecrated building for Anglican worship, typically serving a defined community.'],
    ['Chapel', 'A smaller place of worship, often attached to an estate, school, or institution.'],
    ['Mission', 'A church established to extend Anglican ministry to underserved communities.'],
    ['Ruin', 'A former church building that is no longer structurally intact or in use for worship.'],
    ['Diocese', 'The administrative territory of a bishop. Jamaica and the Cayman Islands form one diocese.'],
    ['Vestry', 'The governing body of a parish, made up of elected lay members and clergy.'],
  ]

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-heading text-3xl font-bold text-crimson mb-6">Glossary</h1>
      <dl className="space-y-4">
        {terms.map(([term, def]) => (
          <div key={term} className="border-l-4 border-gold pl-4">
            <dt className="font-heading text-lg font-semibold text-gray-900">{term}</dt>
            <dd className="font-body text-gray-600 mt-1">{def}</dd>
          </div>
        ))}
      </dl>
    </main>
  )
}
