export default function About() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-heading text-3xl font-bold text-crimson mb-6">About this Project</h1>
      <div className="font-body text-lg text-gray-700 leading-relaxed space-y-4">
        <p>
          This website catalogues Anglican churches across Jamaica &mdash; from grand cathedrals built in the colonial era
          to small mission chapels serving rural fishing villages, and even the ruins of churches long abandoned.
          It brings together maps, photographs, short histories, and heritage information in one place.
        </p>
        <p>
          The project is a work in progress. New churches, images, and historical details are added as sources are
          verified. If you have information, photographs, or corrections to contribute, we welcome your input.
        </p>

        <h2 className="font-heading text-2xl font-bold text-crimson pt-4">What You'll Find Here</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Interactive map</strong> &mdash; Browse churches on a map. Click a marker to see details. Use the parish chips to filter by location.</li>
          <li><strong>Search &amp; filters</strong> &mdash; Search by name, or filter by parish, classification (cathedral, church, chapel, ruin), and status.</li>
          <li><strong>Church pages</strong> &mdash; Each church has a summary, history, architecture notes, clergy information, and notable facts.</li>
          <li><strong>Photographs</strong> &mdash; Images are sourced from field visits and archives, hosted on Cloudinary.</li>
        </ul>

        <h2 className="font-heading text-2xl font-bold text-crimson pt-4">Sources &amp; Accuracy</h2>
        <p>
          Content draws on publications by the Jamaica National Heritage Trust, the Anglican Diocese of Jamaica
          and the Cayman Islands, the National Library of Jamaica, and established historical works. Where details
          could not be verified against primary sources, the text remains general rather than speculative.
        </p>
      </div>
    </main>
  )
}
