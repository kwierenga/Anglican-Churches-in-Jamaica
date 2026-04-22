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
          <li><strong>Search &amp; filters</strong> &mdash; Search by name, or filter by parish, classification (cathedral, parish church, church, chapel, mission, ruin), and status.</li>
          <li><strong>Church pages</strong> &mdash; Each church has a summary, history, architecture notes, clergy information, and notable facts, each with its own <em>References</em> section so readers can check the sources.</li>
          <li><strong>Photographs</strong> &mdash; Images are sourced from field visits and archives, hosted on Cloudinary.</li>
        </ul>

        <h2 className="font-heading text-2xl font-bold text-crimson pt-4">Sources &amp; Accuracy</h2>
        <p>
          Every church narrative cites the sources that support its claims. Where a detail could not be verified
          against a primary or secondary source, the text remains general rather than speculative. The principal
          sources drawn on across the site are listed below, and each church page carries its own reference list.
        </p>

        <h3 className="font-heading text-xl font-semibold text-crimson pt-4">Primary and contemporary sources</h3>
        <ul className="list-disc pl-6 space-y-2 text-base">
          <li>
            <a href="https://anglicanhistory.org/wi/jbellis/diocese/" target="_blank" rel="noopener noreferrer" className="text-crimson hover:underline">
              J. B. Ellis, <em>The Diocese of Jamaica: A short account of its history, growth and organisation</em> (SPCK, 1913)
            </a> &mdash; chapter-by-chapter online edition at anglicanhistory.org.
          </li>
          <li>
            Alfred Caldecott, <em>The Church in the West Indies</em> (SPCK, 1898) &mdash; Lambeth Palace Library via archive.org.
          </li>
          <li>
            W. J. Gardner, <em>A History of Jamaica from its Discovery by Christopher Columbus to the Year 1872</em> (1873).
          </li>
          <li>
            Edward Long, <em>The History of Jamaica</em>, vol. 2 (1774) &mdash; standard eighteenth-century description of the parishes.
          </li>
          <li>
            <em>Handbook of Jamaica</em> for 1891 and 1900 &mdash; annual lists of parishes, clergy, rectories, and mission stations.
          </li>
          <li>
            <em>Jamaica Almanac</em> (1823, 1831, 1865, 1870) &mdash; property holdings, enslaved-population returns, clergy stipends
            (via jamaicanfamilysearch.com).
          </li>
          <li>
            <em>Synod Journals</em> of the Diocese of Jamaica and the Cayman Islands (2015, 2017) and the Nuttall papers.
          </li>
          <li>
            Church of England clergy index and parish registers (where available online).
          </li>
        </ul>

        <h3 className="font-heading text-xl font-semibold text-crimson pt-4">Parish histories</h3>
        <ul className="list-disc pl-6 space-y-2 text-base">
          <li>
            <a href="https://www.parishhistoriesofjamaica.org/" target="_blank" rel="noopener noreferrer" className="text-crimson hover:underline">
              JN Foundation &mdash; <em>Parish Histories of Jamaica</em>
            </a> by Jenny Jemmott, Veront M. Satchell and colleagues at the UWI Department of History and Archaeology.
            Eight parish histories in current use: St. Elizabeth, Manchester, Clarendon, St. Thomas, Portland, St. Mary,
            Hanover, and Westmoreland.
          </li>
          <li>
            <a href="https://nlj.gov.jm/" target="_blank" rel="noopener noreferrer" className="text-crimson hover:underline">
              National Library of Jamaica &mdash; <em>History Notes</em>
            </a> on the parishes (Kingston &amp; St. Andrew, St. Ann, St. Thomas, Portland, Trelawny, Clarendon, St. James,
            Hanover, St. Catherine, Manchester, etc.) and on themes including slavery, Emancipation, and Jamaica&rsquo;s
            National Heroes.
          </li>
        </ul>

        <h3 className="font-heading text-xl font-semibold text-crimson pt-4">Heritage and diocesan sources</h3>
        <ul className="list-disc pl-6 space-y-2 text-base">
          <li>
            <a href="https://www.anglicandioceseja.org/" target="_blank" rel="noopener noreferrer" className="text-crimson hover:underline">
              Anglican Diocese of Jamaica and the Cayman Islands
            </a> &mdash; deanery and cure pages, clergy lists, and diocesan communications.
          </li>
          <li>
            <a href="http://www.jnht.com/" target="_blank" rel="noopener noreferrer" className="text-crimson hover:underline">
              Jamaica National Heritage Trust
            </a> &mdash; designated heritage sites, parish heritage guides, and building-level records.
          </li>
          <li>
            <a href="https://www.ucl.ac.uk/lbs/" target="_blank" rel="noopener noreferrer" className="text-crimson hover:underline">
              UCL Centre for the Study of the Legacies of British Slavery
            </a> &mdash; compensation-era records of Jamaican slave-owners cross-referenced when churches are linked to
            named families or estates.
          </li>
          <li>
            <em>Jamaica Gleaner</em> and <em>Jamaica Observer</em> archives &mdash; contemporary coverage of parish
            anniversaries, clergy appointments, and heritage stories.
          </li>
        </ul>

        <h3 className="font-heading text-xl font-semibold text-crimson pt-4">Secondary works drawn on for context</h3>
        <ul className="list-disc pl-6 space-y-2 text-base">
          <li>Clinton V. Black, <em>The Story of Jamaica</em>.</li>
          <li>Diana Paton, <em>No Bond but the Law: Punishment, Race, and Gender in Jamaican State Formation, 1780&ndash;1870</em>.</li>
          <li>Jonathan Greenland (ed.), <em>Rio Nuevo</em> (Phoenix Press, 2009).</li>
          <li>Frank Cundall, <em>Historic Jamaica</em> (1915) and <em>Place-Names of Jamaica</em> (1939).</li>
          <li>Inez Knibb Sibley, <em>Dictionary of Place-Names in Jamaica</em> (Institute of Jamaica, 1978).</li>
        </ul>

        <p className="text-sm text-gray-500 pt-4">
          Every church page carries a <em>References</em> section pointing to the specific sources used for its
          narrative. If a claim appears on this site that you cannot verify from its cited sources, please let us know.
        </p>
      </div>
    </main>
  )
}
