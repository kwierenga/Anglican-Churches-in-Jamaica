export default function History() {
  return (
    <main className="bg-ivory">
      {/* Hero */}
      <section className="py-20 text-center" style={{ background: 'linear-gradient(140deg, #6B0000 0%, #3a1a2e 45%, #1E2D4E 100%)' }}>
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-gold-bright font-heading text-sm tracking-widest uppercase mb-4">Diocese of Jamaica &amp; The Cayman Islands</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            The Anglican Church in Jamaica
          </h1>
          <p className="font-body text-lg text-white/70 italic">
            Three and a half centuries of faith, colonialism, slavery, emancipation and nationhood
          </p>
        </div>
      </section>

      {/* Facts bar */}
      <section className="bg-navy">
        <div className="max-w-site mx-auto flex flex-wrap justify-center">
          {[
            { num: '1655', label: 'Year of British conquest' },
            { num: '~300', label: 'Anglican churches on the island' },
            { num: '1824', label: 'Diocese of Jamaica established' },
          ].map((s, i) => (
            <div key={i} className="flex-1 min-w-[160px] text-center py-5 border-r border-white/10 last:border-r-0">
              <div className="font-heading text-2xl font-bold text-gold-bright">{s.num}</div>
              <div className="text-xs text-white/60 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky section nav */}
      <nav aria-label="Page sections" className="sticky top-[62px] z-40 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-site mx-auto px-4 flex gap-1 overflow-x-auto py-2 text-sm">
          {[
            { id: 'origins', label: 'Origins' },
            { id: 'colonial', label: 'Colonial Era' },
            { id: 'slavery', label: 'Slavery' },
            { id: 'emancipation', label: 'Emancipation' },
            { id: 'diocese', label: 'Diocese' },
            { id: 'independence', label: 'Independence' },
            { id: 'today', label: 'Today' },
          ].map(s => (
            <button key={s.id}
               onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })}
               className="px-3 py-1 rounded-full whitespace-nowrap text-gray-600 hover:bg-crimson/10 hover:text-crimson font-body transition-colors">
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-16">
        {/* Origins */}
        <section id="origins">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">1655 &ndash; 1700</p>
          <h2 className="font-heading text-3xl font-bold text-crimson mb-1">
            Conquest and the First Churches
            <span className="block w-16 h-[3px] bg-gold mt-3 mb-6" />
          </h2>
          <div className="font-body text-lg leading-relaxed text-gray-700 space-y-4">
            <p>
              The Church of England came to Jamaica not through mission but through military conquest. In May 1655,
              an English naval and land force under Admiral William Penn and General Robert Venables seized the island
              from Spain after a failed attempt on Hispaniola. Jamaica became an English possession by accident rather
              than design, and the new colonial administration needed churches as much as it needed forts.
            </p>
            <p>
              The Spanish had been Catholic and had built several churches during their century and a half of occupation.
              The English demolished or repurposed many of these, and the Church of England was established as the
              official church of the colony almost immediately.
            </p>
            <p>
              The first Church of England ministers arrived with the fleet itself. Within a decade, parishes had been
              mapped across the island following the English vestry system, with each parish responsible for local
              governance as well as worship. By 1664, Governor Sir Thomas Modyford had formalised the parish system,
              dividing Jamaica into seven ecclesiastical and civil parishes.
            </p>
            <p>
              Each parish was required to maintain a rector, a church building, and registers of baptisms, marriages
              and burials &mdash; records that survive today as some of the most important genealogical documents in
              Jamaican history.
            </p>
          </div>
          <blockquote className="border-l-4 border-gold pl-6 my-8 italic text-gray-600 font-body text-lg">
            &ldquo;The parish church stood at the centre of colonial life &mdash; not merely as a place of worship,
            but as courthouse, registry, and the physical embodiment of English authority over the land.&rdquo;
          </blockquote>
        </section>

        {/* Colonial Era */}
        <section id="colonial">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">1700 &ndash; 1800</p>
          <h2 className="font-heading text-3xl font-bold text-crimson mb-1">
            The Sugar Era and the Planter Church
            <span className="block w-16 h-[3px] bg-gold mt-3 mb-6" />
          </h2>
          <div className="font-body text-lg leading-relaxed text-gray-700 space-y-4">
            <p>
              The eighteenth century transformed Jamaica into one of the most valuable colonies in the British Empire.
              Sugar production, driven by the forced labour of hundreds of thousands of enslaved Africans, generated
              enormous wealth for a small class of white planters. The Church of England was their church. Rectors
              were appointed, paid, and largely controlled by the vestries, which were dominated by the planter class.
            </p>
            <p>
              The Anglican church buildings of this period &mdash; many of which still stand &mdash; reflect that wealth:
              cut stone construction, imported fittings, elaborate memorial tablets to planter families lining the
              interior walls. The great parish churches built in this era &mdash; at Lucea, Falmouth, Spanish Town,
              Black River, and elsewhere &mdash; were civic statements as much as places of worship.
            </p>
            <p>
              The church at Lucea, dating from 1725 and now Jamaica's oldest surviving church building, was built
              within two years of the parish of Hanover being constituted. Falmouth's St Peter's, completed in 1796,
              was constructed at the height of Trelawny's sugar prosperity and remains one of the finest Georgian
              churches in the Caribbean, complete with a clock tower that still chimes the hour.
            </p>
            <p>
              The Church of England in Jamaica during this period was almost entirely a church for the white colonial
              population. Enslaved people were largely excluded from the sacraments, and the clergy &mdash; dependent
              on planter goodwill for their livelihoods &mdash; rarely challenged the social order.
            </p>
          </div>
        </section>

        {/* Slavery */}
        <section id="slavery">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">1700 &ndash; 1834</p>
          <h2 className="font-heading text-3xl font-bold text-crimson mb-1">
            Slavery, Exclusion, and the Limits of Ministry
            <span className="block w-16 h-[3px] bg-gold mt-3 mb-6" />
          </h2>
          <div className="font-body text-lg leading-relaxed text-gray-700 space-y-4">
            <p>
              The relationship between the Anglican Church and slavery in Jamaica is one of the most troubling
              chapters in its history, and one that the church has in recent decades confronted with increasing candour.
            </p>
            <p>
              At its worst, the Church of England in Jamaica was an instrument of colonial control. Planters used
              the doctrine of Christian obedience to justify bondage; some clergy openly preached that slavery was
              sanctioned by scripture. In Jamaica, the pattern was broadly one of neglect rather than active cruelty.
              The enslaved population vastly outnumbered the white population, but the church made little organised
              effort to minister to them.
            </p>
            <p>
              The Nonconformist missions &mdash; Moravian, Baptist, Methodist &mdash; filled this vacuum from the
              mid-eighteenth century onwards and won enormous followings among enslaved and freed people. This is
              why, even today, the Anglican church in Jamaica is proportionally smaller than the Baptist and other
              Protestant traditions that have deeper roots in the Black Jamaican community.
            </p>
            <p>
              The Christmas Rebellion of 1831 &mdash; also known as the Baptist War &mdash; was led by Samuel Sharpe,
              a deacon of the Baptist church, and involved around sixty thousand enslaved people across the western
              parishes. The scale of the rebellion, and the moral force of the abolitionist movement in Britain,
              made the end of slavery inevitable. The Slavery Abolition Act was passed in August 1833. On 1 August
              1834, slavery was formally abolished throughout the British Empire.
            </p>
          </div>
          <blockquote className="border-l-4 border-gold pl-6 my-8 italic text-gray-600 font-body text-lg">
            &ldquo;The registers of the parish churches contain the names of thousands of enslaved people &mdash;
            recorded in baptism, in burial, sometimes in marriage. They are the most intimate record we have of
            lives that colonial society otherwise did not bother to document.&rdquo;
          </blockquote>
        </section>

        {/* Emancipation */}
        <section id="emancipation">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">1834 &ndash; 1900</p>
          <h2 className="font-heading text-3xl font-bold text-crimson mb-1">
            Emancipation and a Church Transformed
            <span className="block w-16 h-[3px] bg-gold mt-3 mb-6" />
          </h2>
          <div className="font-body text-lg leading-relaxed text-gray-700 space-y-4">
            <p>
              Emancipation did not immediately transform the Anglican church in Jamaica, but it set in motion
              changes that would reshape it over the following century. The Anglican church responded with a
              belated missionary effort. New churches were built in rural communities, schools were established,
              and clergy were instructed to minister to the freed population.
            </p>
            <p>
              The Diocese of Jamaica, established in 1824 with Christopher Lipscomb as the first bishop, provided
              an organisational framework for this expansion. By the 1840s and 1850s, baptism records in the parish
              registers show a dramatic increase in Black Jamaican names &mdash; families taking English surnames
              for the first time, claiming the sacraments that had been denied or restricted under slavery.
            </p>
            <p>
              This period also produced one of the most significant figures in Jamaican Anglican history:
              <strong> Dr Joseph Robert Love</strong>, a Bahamian-born physician ordained as an Anglican priest
              who became one of the foremost advocates of Black political consciousness in the late nineteenth
              century. Love founded the <em>Jamaica Advocate</em> newspaper in 1894 and is widely credited as
              a direct intellectual influence on Marcus Garvey.
            </p>
            <p>
              The Morant Bay Rebellion of 1865, led by Paul Bogle &mdash; a Baptist deacon &mdash; and the
              subsequent brutal suppression ordered by Governor Eyre, shook the colonial establishment and led
              to Jamaica becoming a Crown Colony under direct British rule.
            </p>
          </div>
        </section>

        {/* Diocese */}
        <section id="diocese">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">1824 &ndash; 1950</p>
          <h2 className="font-heading text-3xl font-bold text-crimson mb-1">
            The Diocese Takes Shape
            <span className="block w-16 h-[3px] bg-gold mt-3 mb-6" />
          </h2>
          <div className="font-body text-lg leading-relaxed text-gray-700 space-y-4">
            <p>
              The Diocese of Jamaica was created in 1824, making it one of the oldest Anglican dioceses in the
              Western Hemisphere. The creation of the diocese gave the church in Jamaica a permanent episcopal
              presence and the ability to ordain, confirm, and govern its own affairs.
            </p>
            <p>
              The early bishops faced enormous challenges: a vast and dispersed population, inadequate church
              buildings, a climate hostile to English clergy, and the social disruptions of emancipation. The
              church's educational role became central to its mission: Anglican schools spread across the island,
              many serving communities that had no other access to formal education. Institutions like Glenmuir
              High School in May Pen and Rusea's High School in Lucea trace their roots directly to this Anglican
              educational mission.
            </p>
            <p>
              Through the late nineteenth and early twentieth centuries, the diocese gradually shifted in character.
              The white planter class declined as sugar collapsed, emigrated, or died out. The church's congregation
              became increasingly Afro-Jamaican. The clergy, however, remained predominantly expatriate British well
              into the twentieth century, a source of ongoing tension as Jamaican nationalism gathered force.
            </p>
          </div>
        </section>

        {/* Independence */}
        <section id="independence">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">1950 &ndash; 1980</p>
          <h2 className="font-heading text-3xl font-bold text-crimson mb-1">
            Independence and Jamaican Leadership
            <span className="block w-16 h-[3px] bg-gold mt-3 mb-6" />
          </h2>
          <div className="font-body text-lg leading-relaxed text-gray-700 space-y-4">
            <p>
              Jamaica achieved independence from Britain on 6 August 1962. The Anglican church was by then deeply
              woven into the fabric of Jamaican national life &mdash; in its schools, its parish records, its
              physical presence at the centre of nearly every town and village on the island. But independence
              posed a direct question: could an institution so closely identified with British colonial authority
              reinvent itself as a genuinely Jamaican church?
            </p>
            <p>
              The answer came gradually, through Jamaican leadership. The appointment of Jamaican-born bishops,
              the training of Jamaican clergy, and the development of liturgy and music that reflected Caribbean
              culture rather than English convention all marked the church's transition. The Province of the West
              Indies, established in 1883, had given the regional church a degree of autonomy within the Anglican
              Communion.
            </p>
            <p>
              The 1960s and 1970s were a period of profound cultural change in Jamaica, with Rastafarianism,
              Black Power, and reggae music all challenging the values associated with the colonial establishment.
              Some clergy engaged openly with questions of social justice and Black consciousness; others retreated
              into institutional conservatism.
            </p>
          </div>
        </section>

        {/* Today */}
        <section id="today">
          <p className="text-xs font-semibold tracking-widest text-crimson-mid uppercase mb-2">1980 &ndash; Present</p>
          <h2 className="font-heading text-3xl font-bold text-crimson mb-1">
            The Church Today
            <span className="block w-16 h-[3px] bg-gold mt-3 mb-6" />
          </h2>
          <div className="font-body text-lg leading-relaxed text-gray-700 space-y-4">
            <p>
              The Anglican Church in Jamaica today is a significant national institution with approximately three
              hundred churches serving communities across all fourteen parishes. Its schools educate tens of
              thousands of Jamaican children. Its clergy are overwhelmingly Jamaican-born. Its worship blends
              traditional Anglican liturgy with Caribbean music, spontaneity and warmth that would be unfamiliar
              in an English parish church.
            </p>
            <p>
              The physical inheritance of three and a half centuries is both a gift and a burden. The great
              colonial-era parish churches are national monuments &mdash; architecturally significant, historically
              irreplaceable, and chronically underfunded. Hurricane damage is a recurring threat: Hurricanes
              Gilbert (1988), Ivan (2004), Beryl (2024) and Melissa (2025) have each taken a toll on church
              buildings across the island.
            </p>
            <p>
              The church has also engaged, with varying degrees of openness, with its history of complicity in
              slavery. The Church of England in Britain issued a formal apology for its role in the slave trade
              in 2023. The Diocese of Jamaica, whose own history is inseparable from that of slavery, emancipation
              and the long struggle for dignity and equality, continues to work out what that history means for
              its identity, its mission, and its relationship with the Jamaican people it serves.
            </p>
          </div>
          <blockquote className="border-l-4 border-gold pl-6 my-8 italic text-gray-600 font-body text-lg">
            &ldquo;To walk through a Jamaican Anglican churchyard is to walk through Jamaican history itself &mdash;
            through colonialism and slavery, through emancipation and migration, through independence and storm.
            The stones do not flinch from any of it.&rdquo;
          </blockquote>
        </section>
      </div>
    </main>
  )
}
