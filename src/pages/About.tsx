import { to } from '../lib/router'

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

        <h2 className="font-heading text-2xl font-bold text-crimson pt-4">Photographs &amp; Credits</h2>
        <p>
          Photographs come from field visits, the Diocese and its parishes, and archive and heritage
          collections. Where a photographer or rights-holder is on record, the credit is shown beneath the
          image. A substantial number of the older images carry no recorded credit &mdash; roughly half the
          collection &mdash; and we would rather say so than imply a provenance we cannot support. If you can
          identify the source of an uncredited photograph, or hold rights to one, please get in touch and we
          will credit it or remove it.
        </p>
        <p>
          Around half the churches on the site have no photograph at all.{' '}
          <a href={`${to('/churches')}?needsphoto=1`} className="text-crimson hover:underline">
            The directory can list exactly which ones
          </a>
          , and every church page carries a link to contribute an image.
        </p>

        <h2 className="font-heading text-2xl font-bold text-crimson pt-4">Acknowledgments</h2>
        <p>
          This project is indebted to the Anglican Diocese of Jamaica and the Cayman Islands, the Jamaica
          National Heritage Trust, the National Library of Jamaica, parish archives and local historians, and
          the newspapers and journals whose reporting fills the gaps the archives leave.
        </p>

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
        </ul>

        <h3 className="font-heading text-xl font-semibold text-crimson pt-4">UK Anglican and imperial archives</h3>
        <ul className="list-disc pl-6 space-y-2 text-base">
          <li>
            <a href="http://anglicanhistory.org/wi/jm/" target="_blank" rel="noopener noreferrer" className="text-crimson hover:underline">
              Project Canterbury &mdash; Jamaica page
            </a> &mdash; full text of A. M. Campbell&rsquo;s sermon at the consecration of Bishop Lipscombe (Lambeth Chapel, 25 July 1824);
            Lipscomb&rsquo;s <em>Charge to Candidates for Holy Orders</em> in Spanish Town Cathedral (1825); and other
            nineteenth-century Jamaica pamphlets.
          </li>
          <li>
            <a href="https://www.lambethpalacelibrary.info/collections/manuscripts/" target="_blank" rel="noopener noreferrer" className="text-crimson hover:underline">
              Lambeth Palace Library &mdash; Fulham Papers, vol. 18 (Jamaica, 1740&ndash;1821)
            </a> &mdash; correspondence to the Bishop of London from Jamaican clergy (William May, John Barton, Colin Donaldson,
            James White). Calendar at the&nbsp;
            <a href="https://loyalist.lib.unb.ca/record/fulham-papers-lambeth-palace-library-1626-1822" target="_blank" rel="noopener noreferrer" className="text-crimson hover:underline">
              UNB Loyalist Collection
            </a>.
          </li>
          <li>
            <a href="https://discovery.nationalarchives.gov.uk/details/r/C4328" target="_blank" rel="noopener noreferrer" className="text-crimson hover:underline">
              UK National Archives, Kew &mdash; Colonial Office, CO 137 (Jamaica Original Correspondence)
            </a> &mdash; includes CO 137/395, Governor Eyre to Cardwell, 20 November 1865 (Morant Bay Rebellion); and companion series
            CO 140 (Jamaica sessional papers) and CO 441 (out-letters).
          </li>
          <li>
            <a href="https://archives.bodleian.ox.ac.uk/repositories/2/resources/1576" target="_blank" rel="noopener noreferrer" className="text-crimson hover:underline">
              Bodleian Library, Oxford &mdash; USPG / SPG archive (GB 0162 SPG)
            </a> &mdash; papers of the Society for the Propagation of the Gospel, 1701&ndash;1980s. Early Jamaica letters (c.1701&ndash;1720)
            are indexed free in&nbsp;
            <a href="http://emlo-portal.bodleian.ox.ac.uk/collections/?catalogue=society-for-the-propagation-of-the-gospel" target="_blank" rel="noopener noreferrer" className="text-crimson hover:underline">
              EMLO &mdash; SPG Correspondence
            </a>.
          </li>
          <li>
            <a href="https://www.familysearch.org/en/search/collection/1827268" target="_blank" rel="noopener noreferrer" className="text-crimson hover:underline">
              FamilySearch &mdash; Jamaica, Church of England Parish Register Transcripts, 1664&ndash;1880
            </a> &mdash; indexed baptism, marriage, and burial entries arranged by parish, naming officiating clergy.
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
