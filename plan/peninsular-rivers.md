# Peninsular River Hunt — Game Spec (concise)

Third `/games` entry. Same conventions as River Hunt and Ranges & Passes —
reuse the map component, Explore+Hunt tabs, region rail for clustering,
unlabeled-until-hover markers, clue-driven click mechanic, declutter
rules from the fix doc. Don't re-derive any of that, just plug this data
in. (This also absorbs the peninsular cities/rivers flagged as
out-of-scope in the original river-hunt data file.)

## Scope
East-flowing rivers (Deccan tilt → Bay of Bengal, form deltas) and
West-flowing rivers (→ Arabian Sea, form estuaries). Goa/Kerala/Karnataka
coastal rivers cluster tightly — give them their own region panels, same
pattern as the Himalaya region panels.

## East Flowing

| River | Origin | Key facts | Tributaries |
|---|---|---|---|
| Mahanadi | Sihawa Hills, Chhattisgarh | 900 km, 3rd largest peninsular river; Hirakud Dam (India's longest); Chilika Lake near mouth | Tel, Jonk, Ong, Hasdeo, Mand, Ib, Seonath |
| Godavari | Trimbakeshwar Plateau (W. Ghats), Nasik, MH | 1,465 km, largest peninsular river; "Dakshin Ganga"/"Vridha Ganga"; Gautami branch reaches the Bay via the Yanam enclave | Pravara, Purna, Manjira, Pranhita, Indravati, Sabari |
| Krishna | Mahabaleshwar, W. Ghats, MH | 1,400 km, 2nd longest river of South India | Bhima, Tungabhadra, Ghataprabha, Malaprabha, Musi, Koyna, Dudhganga, Yerla, Warna, Dindi |
| Kaveri (Cauvery) | Brahmagiri Hills, Kodagu, Karnataka | 800 km; only perennial South Indian river; "Ganga of the South"; delta = "Granary of South India"; called "Ponni" in Tamil Nadu | Hemavati, Kabini, Bhavani, Shimsha, Amaravati |
| Pennar | Nandi Hills, Chikkaballapura, Karnataka | aka "Uttara Pinakini"; independent river of Andhra Pradesh | — |
| Damodar | Chotanagpur Plateau rift valley, Jharkhand | "Sorrow of Bengal" (floods); joins the Hugli | Bokaro, Barakar, Konar |
| Subarnarekha | Ranchi Plateau, Jharkhand | gold particles in its sand → name means "Streak of Gold" | — |
| Baitarani | Gonasikha/Guptaganga Hills, Odisha | joins Brahmani to form a delta | — |
| Brahmani | Sankh + South Koel confluence, near Rourkela, Odisha | joins Baitarani → delta | — |
| Vaigai | Tamil Nadu | southernmost river of India | — |

**Cauvery Water Dispute** (enrichment fact, attach to Kaveri): Karnataka
vs. Tamil Nadu, also involves Kerala & Puducherry. Final allocated
shares: Tamil Nadu 404.25 TMC, Karnataka 284.75 TMC, Kerala 30 TMC,
Puducherry 7 TMC.

## West Flowing

| River | Origin | Key facts | Tributaries |
|---|---|---|---|
| Narmada | Amarkantak Plateau, MP | 1,312 km, longest west-flowing river; drains into the Gulf of Khambhat; rift valley between the Vindhya & Satpura ranges; forms Dhuandhar Falls at Bhedaghat, Jabalpur | Banjar, Tawa, Shakkar, Halon |
| Tapi (Tapti) | Multai, Betul district, MP (Satpura Range) | 724 km; 80% of basin in Maharashtra; 2nd-longest westward river; rift valley alongside the Narmada; Surat sits on its bank | Aner, Gomai, Purna, Bori, Girna, Arunawati |
| Mahi | Vindhya mountains | crosses the Tropic of Cancer twice | — |
| Sabarmati | Aravalli Range | — | — |
| Luni | Nag Pahar (Naga Hills), Ajmer, Rajasthan | aka "Lavanavari"; endorheic — ends in the Rann of Kutch, never reaches the sea; India's only major saline river | — |

## Region panels (coastal clusters)

**Goa** — Zuari (estuary, Mormugao Bay); Mandovi ("lifeline of Goa,"
Panaji on its bank)

**Kerala** — Periyar ("lifeline of Kerala," Kerala's longest);
Bharathapuzha (aka Ponnani river); Pamba (drains into Vembanad Lake)

**Karnataka** — Kali (aka Kalinadi); Sharavati (Jog Falls); Varahi
(Kunchikal Falls, India's highest waterfall)

## Enrichment facts (not clues — attach to nearby delta/river clicks)
- APJ Abdul Kalam Islands (formerly Wheeler Islands), near the Dhamra
  river mouth — the Baitarani–Brahmani confluence
- Bhitarkanika National Park sits in the Brahmani-Baitarani-Dhamra delta
- Gahirmatha Marine Sanctuary (world's largest) and Rushikulya beach
  (2nd largest) are India's top Olive Ridley turtle nesting sites

## Build notes
- Overview map shows only the 10 East-flowing + 5 West-flowing rivers
  above, as unlabeled lines (hover/tap for name), per the declutter
  rules already established.
- Goa, Kerala, and Karnataka become region-panel entries for their
  smaller coastal rivers.
- Explore (labeled study map) ships before Hunt (clue-driven quiz), same
  order as the other two games.