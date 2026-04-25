# Coordinate audit — 57/306 suspect rows

Score reflects how many heuristics fired. **High score** ≈ likely placeholder.

Heuristics:
- low precision (≤3 decimal places)
- round-number coords (multiples of 0.05)
- coords shared verbatim with another church
- outlier from parish median (modified Z-score)

---

| Score | Church | Town | Parish | Coords | Reasons |
|---|---|---|---|---|---|
| 5 | All Saints' | Mt. Providence | Clarendon | `18.10, -77.30` | low precision (1 dp); round-number coords |
| 5 | St. Michael's | Arthur's Seat | Clarendon | `18.15, -77.40` | low precision (1 dp); round-number coords |
| 5 | Peckham | Peckham | Clarendon | `17.90, -77.20` | low precision (1 dp); round-number coords |
| 5 | St. Luke's | Mitchell Town | Clarendon | `17.85, -77.30` | low precision (1 dp); round-number coords |
| 5 | St. Andrew's | Rocky Point | Clarendon | `17.80, -77.15` | low precision (1 dp); round-number coords |
| 5 | St. Mark's | Hopewell | Westmoreland | `18.2500, -78.3000` | low precision (1 dp); round-number coords |
| 5 | St. Michael and All Angels | Manchester | Manchester | `18.10, -77.50` | low precision (1 dp); round-number coords |
| 5 | Whitby | Whitby | Manchester | `18.20, -77.60` | low precision (1 dp); round-number coords |
| 5 | St. Simon's | Top Hill | St. Catherine | `18.10, -77.10` | low precision (1 dp); round-number coords |
| 4 | Harry Watch | Harry Watch | Manchester | `18.15, -77.55` | low precision (2 dp); round-number coords |
| 4 | Holy Trinity | St. Toolies | Manchester | `18.05, -77.45` | low precision (2 dp); round-number coords |
| 4 | St. Paul's | Clapham | St. Catherine | `18.15, -77.05` | low precision (2 dp); round-number coords |
| 3 | St. Boniface | Harbour View | Kingston | `17.94754, -76.71709` | outlier in Kingston (Z lat=5.9, Z lng=6.4) |
| 3 | St. Peter's | Port Royal | Kingston | `17.93710, -76.84132` | outlier in Kingston (Z lat=8.2, Z lng=4.9) |
| 3 | St. Michael's | Mavis Bank | St. Andrew | `18.03102, -76.65719` | outlier in St. Andrew (Z lat=0.2, Z lng=5.6) |
| 3 | St. Lawrence's | Camperdown | St. Catherine | `18.16710, -77.53320` | outlier in St. Catherine (Z lat=1.8, Z lng=11.7) |
| 3 | Christ Church | Adelphi | St. James | `18.447645, -77.789607` | outlier in St. James (Z lat=1.0, Z lng=5.9) |
| 3 | St. Stephen's | Cornwall Mountain | Westmoreland | `18.31, -78.10` | low precision (1 dp) |
| 2 | Church of the White Cross (Ruins) | The Cross | Clarendon | `17.95, -77.217` | low precision (2 dp) |
| 2 | Woodall | Woodall | Clarendon | `18.12, -77.35` | low precision (2 dp) |
| 2 | St. Luke's | Juan-de-Bolas | St. Catherine | `18.09, -76.95` | low precision (2 dp) |
| 2 | St. Alban's | Ashton | Westmoreland | `18.27, -77.983` | low precision (2 dp) |
| 2 | All Saints' | Meylersfield | Westmoreland | `18.21, -78.07` | low precision (2 dp) |
| 2 | Ramble Anglican Church | Ramble | Hanover | `18.3510, -77.9774` | low precision (3 dp); borderline outlier in Hanover |
| 1 | St. Mark's | Beckford Kraal | Clarendon | `18.0833, -77.3130` | low precision (3 dp) |
| 1 | St. Luke's | Sanguinetti | Clarendon | `18.15614, -77.43211` | borderline outlier in Clarendon |
| 1 | Hanover Parish Church | Lucea | Hanover | `18.44964, -78.17051` | borderline outlier in Hanover |
| 1 | St. George's Church | 83 East Street | Kingston | `17.973, -76.7897` | low precision (3 dp) |
| 1 | Christ Church | Vineyard Town | Kingston | `17.989505, -76.771522` | borderline outlier in Kingston |
| 1 | St. John the Divine | Alston | Manchester | `18.1830, -77.4360` | low precision (3 dp) |
| 1 | St. Mark's (Parish Church) | Mandeville | Manchester | `18.0375, -77.508` | low precision (3 dp) |
| 1 | St. Barnabas' | Mile Gully | Manchester | `18.1355, -77.543` | low precision (3 dp) |
| 1 | St. Philip's | Old England | Manchester | `17.9978, -77.467` | low precision (3 dp) |
| 1 | St. Michael's | John's Hall | Portland | `18.09200, -76.46300` | low precision (3 dp) |
| 1 | St. Thomas' | Manchioneal | Portland | `18.03624, -76.27999` | borderline outlier in Portland |
| 1 | Christ Church (Parish Church) | Port Antonio | Portland | `18.17700, -76.44979` | low precision (3 dp) |
| 1 | St. Philip's | Brandon Hill | St. Andrew | `18.1482, -76.8051` | borderline outlier in St. Andrew |
| 1 | St. David's | Brittonville | St. Ann | `18.1923, -77.2823` | borderline outlier in St. Ann |
| 1 | St. Peter's | Lluidas Vale | St. Catherine | `18.2212, -77.1823` | borderline outlier in St. Catherine |
| 1 | St. Dorothy's Church | Old Harbour | St. Catherine | `17.942162, -77.089092` | borderline outlier in St. Catherine |
| 1 | Holy Trinity | Old Harbour | St. Catherine | `17.939424, -77.113108` | borderline outlier in St. Catherine |
| 1 | St. Philip's | Old Harbour Bay | St. Catherine | `17.907396, -77.096637` | borderline outlier in St. Catherine |
| 1 | Church of Reconciliation | Portmore | St. Catherine | `17.95778652760367, -76.88129636231977` | borderline outlier in St. Catherine |
| 1 | SS Michael and George's | Freetown | St. Catherine | `17.917912, -77.145950` | borderline outlier in St. Catherine |
| 1 | All Saints' | Guy's Hill | St. Catherine | `18.255059, -76.933850` | borderline outlier in St. Catherine |
| 1 | St. Barnabas' | Crawford | St. Elizabeth | `18.04411, -77.91383` | borderline outlier in St. Elizabeth |
| 1 | St. Thomas' | Kings (Whitehouse) | Westmoreland | `18.08371, -77.95403` | borderline outlier in Westmoreland |
| 1 | St. Saviour's | Chichester | St. James | `18.325390, -78.009098` | borderline outlier in St. James |
| 1 | St. Stephen's Mission | Cornwall Mountain | St. James | `18.286153, -77.986714` | borderline outlier in St. James |
| 1 | St. Luke's | Vaughnsfield | St. James | `18.3527, -77.82523` | borderline outlier in St. James |
| 1 | St. Martin's Mission | Bull Bay | St. Thomas | `17.94272, -76.65744` | borderline outlier in St. Thomas |
| 1 | St. Andrew's | Golden Grove | St. Thomas | `17.92379, -76.26882` | borderline outlier in St. Thomas |
| 1 | St. John's Church (Old) | Leith Hall | St. Thomas | `17.87464, -76.33937` | borderline outlier in St. Thomas |
| 1 | Christ Church | Morant Bay | St. Thomas | `17.88114, -76.40884` | borderline outlier in St. Thomas |
| 1 | St. David's | Yallahs | St. Thomas | `17.87727, -76.56833` | borderline outlier in St. Thomas |
| 1 | St. Thomas' | Bluefields | Westmoreland | `18.17200, -78.02500` | low precision (3 dp) |
| 1 | St. Mary's | Negril | Westmoreland | `18.27898, -78.35193` | borderline outlier in Westmoreland |
