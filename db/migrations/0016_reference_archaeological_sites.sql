BEGIN;

-- Register bibliographic sources for archaeological site coordinates and gazetteers
INSERT INTO sources (stable_id, record_scope, status, source_type, citation_key, title, authors, publication_year, publisher_or_journal)
VALUES
  (
    'SRC-POSSEHL-2002-GAZETTEER',
    'research',
    'active',
    'monograph',
    'Possehl2002Indus',
    'The Indus Civilization: A Contemporary Perspective',
    'Gregory L. Possehl',
    2002,
    'AltaMira Press / Rowman & Littlefield (Appendix A: Site Gazetteer)'
  ),
  (
    'SRC-UNESCO-DHOLAVIRA-2021',
    'research',
    'active',
    'catalogue',
    'UNESCO2021Dholavira',
    'Dholavira: a Harappan City (World Heritage Inscription Dossier 1642)',
    'UNESCO World Heritage Centre / Archaeological Survey of India',
    2021,
    'UNESCO World Heritage Committee'
  ),
  (
    'SRC-ASI-EXCAVATION-REPORTS',
    'research',
    'active',
    'monograph',
    'ASIReportsIndus',
    'Memoirs and Excavation Reports of the Archaeological Survey of India (Lothal, Kalibangan, Surkotada, Banawali, Rakhigarhi)',
    'Archaeological Survey of India (S.R. Rao, B.B. Lal, J.P. Joshi, R.S. Bisht, A. Nath)',
    2014,
    'Director General, Archaeological Survey of India'
  )
ON CONFLICT (stable_id) DO NOTHING;

-- Insert verified reference-only archaeological sites.
-- NOTE: Mohenjo-daro (SITE-MOHENJO-DARO) is the active V1 corpus site and is preserved untouched.
-- All reference sites below have 0 ingested corpus artefacts in the current database release.
-- Coordinates represent site-level benchmark datums (not individual seal findspots).
INSERT INTO sites (
  stable_id, record_scope, status, canonical_name, modern_region, country, latitude, longitude, coordinate_precision_meters, notes
)
VALUES
  (
    'SITE-HARAPPA',
    'research',
    'active',
    'Harappa',
    'Punjab',
    'Pakistan',
    30.630000,
    72.865000,
    1000,
    'Site-level datum for the Harappa mound complex (Mounds AB, E, ET, F) south of the former course of the Ravi River, Sahiwal District, Punjab, Pakistan. Coordinate provenance: Possehl, Gregory L. (2002), "The Indus Civilization: A Contemporary Perspective", Appendix A (p. 245); Kenoyer, J.M. (1998), "Ancient Cities of the Indus Valley Civilization". Precision ±1000 m covers the multi-mound urban perimeter.'
  ),
  (
    'SITE-DHOLAVIRA',
    'research',
    'active',
    'Dholavira',
    'Gujarat',
    'India',
    23.886400,
    70.213100,
    500,
    'Site-level datum for the fortified city and reservoirs on Khadir Bet in the Great Rann of Kutch, Bhachau taluka, Gujarat, India. Coordinate provenance: UNESCO World Heritage Centre (2021), "Dholavira: a Harappan City", Dossier 1642 (official property coordinates 23°53''10"N, 70°12''47"E); Bisht, R.S. (2014), "Excavations at Dholavira (1989-90 to 2004-2005)", Archaeological Survey of India (ASI). Precision ±500 m reflects the walled urban core.'
  ),
  (
    'SITE-RAKHIGARHI',
    'research',
    'active',
    'Rakhigarhi',
    'Haryana',
    'India',
    29.288900,
    76.116700,
    1000,
    'Site-level datum for the multi-mound urban complex on the palaeochannel of the Drishadvati/Chautang River, Hisar District, Haryana, India. Coordinate provenance: Nath, Amarendra (2014), "Excavations at Rakhigarhi (1997-1998 to 1999-2000)", Archaeological Survey of India; Possehl (2002) Gazetteer. Precision ±1000 m reflects the wide spatial extent of Mounds 1 through 9.'
  ),
  (
    'SITE-LOTHAL',
    'research',
    'active',
    'Lothal',
    'Gujarat',
    'India',
    22.522200,
    72.249700,
    500,
    'Site-level datum for the acropolis, lower town, and brick basin near Saragwala village, Dholka taluka, Ahmedabad District, Gujarat, India. Coordinate provenance: Rao, S.R. (1979), "Lothal: A Harappan Port Town (1955-62)", Memoirs of the Archaeological Survey of India, No. 78, Vol. 1, p. 13 (22°31''19"N, 72°14''59"E). Precision ±500 m encompasses the entire fortified settlement and basin.'
  ),
  (
    'SITE-KALIBANGAN',
    'research',
    'active',
    'Kalibangan',
    'Rajasthan',
    'India',
    29.473600,
    74.131100,
    500,
    'Site-level datum for mounds KLB-1 (citadel) and KLB-2 (lower city) on the southern bank of the dry Ghaggar River, Hanumangarh District, Rajasthan, India. Coordinate provenance: Lal, B.B., Joshi, J.P., et al. (2003), "Excavations at Kalibangan: The Early Harappans (1960-1969)", Archaeological Survey of India, p. 1 (29°28''N, 74°08''E); Possehl (2002) Gazetteer. Precision ±500 m.'
  ),
  (
    'SITE-CHANHUDARO',
    'research',
    'active',
    'Chanhudaro',
    'Sindh',
    'Pakistan',
    26.175000,
    68.316700,
    500,
    'Site-level datum for the Chanhu-daro mound cluster east of the Indus River, Shaheed Benazirabad (Nawabshah) District, Sindh, Pakistan. Coordinate provenance: Mackay, E.J.H. (1943), "Chanhu-daro Excavations 1935-36", American Oriental Society, Vol. 20, p. 1 (26°10''30"N, 68°19''00"E); Possehl (2002) Gazetteer. Precision ±500 m covers Mounds I, II, and III.'
  ),
  (
    'SITE-BANAWALI',
    'research',
    'active',
    'Banawali',
    'Haryana',
    'India',
    29.605000,
    75.390000,
    500,
    'Site-level datum for the fortified settlement on the ancient Rangoi/Sarasvati channel, Fatehabad District, Haryana, India. Coordinate provenance: Bisht, R.S. (1982), "Excavations at Banawali: 1974-77", in Possehl (ed.), Harappan Civilization, pp. 113-124 (29°36''N, 75°23''E); Archaeological Survey of India. Precision ±500 m reflects the fortified perimeter.'
  ),
  (
    'SITE-SURKOTADA',
    'research',
    'active',
    'Surkotada',
    'Gujarat',
    'India',
    23.620000,
    70.830000,
    500,
    'Site-level datum for the fortified citadel and residential annex, Rapar taluka, Kutch District, Gujarat, India. Coordinate provenance: Joshi, J.P. (1990), "Excavation at Surkotada: 1971-72 and Exploration in Kutch", Memoirs of the Archaeological Survey of India, No. 87, p. 1 (23°37''N, 70°50''E). Precision ±500 m covers the fortified mound complex.'
  ),
  (
    'SITE-SUTKAGAN-DOR',
    'research',
    'active',
    'Sutkagan Dor',
    'Balochistan',
    'Pakistan',
    25.500000,
    61.833300,
    1000,
    'Site-level datum for the fortified citadel on a natural rock ridge overlooking the Dasht River, Gwadar District, Makran, Balochistan, Pakistan (westernmost known Indus outpost). Coordinate provenance: Stein, Aurel (1931), "An Archaeological Tour in Gedrosia", Memoirs of the ASI, No. 43; Dales, George F. (1962), "A Search for Ancient Harappan Seaports", Expedition 4(2): 2-10 (25°30''N, 61°50''E); Possehl (2002) Gazetteer. Precision ±1000 m accounts for rugged topography.'
  )
ON CONFLICT (stable_id) DO NOTHING;

-- Index sites with non-null coordinates for fast geospatial and map queries
CREATE INDEX IF NOT EXISTS idx_sites_coordinates ON sites (latitude, longitude) WHERE latitude IS NOT NULL;

COMMIT;
