export interface ParishInfo {
  slug: string
  name: string
  region: string
  heroImage: string
  blurb: string
}

export const PARISHES: ParishInfo[] = [
  {
    slug: 'kingston',
    name: 'Kingston',
    region: 'South coast',
    heroImage: 'st-andrew-1_souv07',
    blurb:
      'The capital parish. Kingston rose from the ruins of Port Royal after the 1692 earthquake on 200 acres purchased from Sir William Beeston — Colonel Barry\u2019s Hog Crawle — and became Jamaica\u2019s official capital in 1872.',
  },
  {
    slug: 'st-andrew',
    name: 'St. Andrew',
    region: 'South coast',
    heroImage: 'st-andrew-1_souv07',
    blurb:
      'Originally called Liguanea, St. Andrew was one of the original 1664 parishes. St. Andrew Parish Church at Half-Way-Tree (founded 1664, current building 1700) is the oldest surviving Anglican church in Jamaica. Amalgamated with Kingston as the Corporate Area in 1923.',
  },
  {
    slug: 'st-thomas',
    name: 'St. Thomas',
    region: 'South-east',
    heroImage: 'morant-bay-1_iipt39',
    blurb:
      'Great sugar parish of eastern Jamaica. Christ Church Morant Bay (1865) sits beside the courthouse where Paul Bogle\u2019s Rebellion began — the most consequential civil uprising in 19th-century Jamaica and the event that ended the House of Assembly.',
  },
  {
    slug: 'portland',
    name: 'Portland',
    region: 'North-east',
    heroImage: 'port-antonio-1_axr4uq',
    blurb:
      'Formed in 1723 from parts of St. George and St. Thomas in the East. Home to Moore Town, the main settlement of the Windward Maroons, where Nanny received a 500-acre treaty grant in 1746.',
  },
  {
    slug: 'st-mary',
    name: 'St. Mary',
    region: 'North coast',
    heroImage: 'port-maria-1_vbewjz',
    blurb:
      'Site of Tacky\u2019s Revolt (1760), the most significant slave rebellion in the British West Indies between 1733 and the Haitian Revolution. Holy Trinity Retreat (c. 1835) is the oldest standing Anglican church in the parish.',
  },
  {
    slug: 'st-ann',
    name: 'St. Ann',
    region: 'North coast',
    heroImage: 'st-anns-bay-1_vflxsr',
    blurb:
      'Jamaica\u2019s "Garden Parish". Cradle of the nation from its Spanish settlement at Sevilla la Nueva. Birthplace of National Hero Marcus Garvey and of Bob Marley. St. Mark\u2019s Brown\u2019s Town (1805) was founded by the Irish planter Hamilton Brown.',
  },
  {
    slug: 'trelawny',
    name: 'Trelawny',
    region: 'North coast',
    heroImage: 'falmouth-1_f1ngmy',
    blurb:
      'Carved from St. James in 1770. Falmouth — laid out in 1769 on land donated by John Tharp — is one of the finest surviving Georgian towns in the Caribbean. St. Peter\u2019s Parish Church (1794–96) is its Anglican centrepiece.',
  },
  {
    slug: 'st-james',
    name: 'St. James',
    region: 'North coast',
    heroImage: 'montego-bay-1_j6tuwf',
    blurb:
      'Montego Bay is Jamaica\u2019s second city. St. James Parish Church in Sam Sharpe Square stands where the 1831–32 Baptist War was led by National Hero Sam Sharpe, a Baptist deacon executed in the square in 1832.',
  },
  {
    slug: 'hanover',
    name: 'Hanover',
    region: 'North-west',
    heroImage: 'lucea-1_ylkphu',
    blurb:
      'Formed in 1723 from parts of both Westmoreland and St. James. Hanover Parish Church at Lucea stands opposite the harbour and Fort Charlotte. Rev. Henry Clarke founded the Westmoreland Building Society in 1874 — Jamaica\u2019s first — from Grange Hill.',
  },
  {
    slug: 'westmoreland',
    name: 'Westmoreland',
    region: 'West',
    heroImage: 'savannah-la-mar-1_lljfrb',
    blurb:
      'Jamaica\u2019s westernmost parish. St. George\u2019s Savanna-la-Mar has faced repeated catastrophic hurricanes (1748, 1780, 1790, 1912). Peter Beckford\u2019s name survives at Petersfield.',
  },
  {
    slug: 'st-elizabeth',
    name: 'St. Elizabeth',
    region: 'South-west',
    heroImage: 'black-river-2_jjvifi',
    blurb:
      'Created as one of the original 1664 parishes. Black River was once the wealthiest town in Jamaica thanks to logwood exports. St. John\u2019s Black River is a yellow-brick landmark of the south-west coast. Hurricane Melissa (2025) struck this coast hardest.',
  },
  {
    slug: 'manchester',
    name: 'Manchester',
    region: 'Central highlands',
    heroImage: 'mandeville-1_iil8jb',
    blurb:
      'Created in December 1814 and named for the Duke of Manchester, then Governor. Mandeville was laid out at 2,000 ft elevation as a cool-climate administrative centre. St. Mark\u2019s Mandeville\u2019s organ loft was used as a jail during the 1831–32 Baptist War.',
  },
  {
    slug: 'clarendon',
    name: 'Clarendon',
    region: 'South-central',
    heroImage: 'may-pen-1_qnspzn',
    blurb:
      'Absorbed the ancient parish of Vere in 1867 under Law 20. May Pen — named for Rev. William May (b. 1695) — became the parish capital in 1887. St. Peter\u2019s Alley (1671) is the third-oldest Anglican church in Jamaica.',
  },
  {
    slug: 'st-catherine',
    name: 'St. Catherine',
    region: 'South-central',
    heroImage: 'spanish-town-1_fdfjqi',
    blurb:
      'Contains Spanish Town — Jamaica\u2019s capital from 1538 to 1872 — and the Cathedral of St. Jago de la Vega, the oldest Anglican cathedral site in the Western Hemisphere. Bishop Lipscomb was enthroned here as first Bishop of Jamaica on 15 February 1825.',
  },
]

export const PARISH_BY_NAME = new Map(PARISHES.map(p => [p.name.toLowerCase(), p]))
export const PARISH_BY_SLUG = new Map(PARISHES.map(p => [p.slug, p]))

export function slugifyParish(name: string): string {
  return name.toLowerCase().replace(/\./g, '').replace(/\s+/g, '-')
}
