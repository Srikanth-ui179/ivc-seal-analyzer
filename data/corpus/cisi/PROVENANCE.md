# CISI Corpus Delivery - Provenance Note

## What this is

This directory contains a local copy of the corpus data from:
  https://github.com/mayig/indus-valley-script-corpus
(files under corpus/m001_m099/ and corpus/m100_m199/)

## What this is NOT

This is NOT the official Mahadevan (1977) M77/IDF-80 dataset.
This is NOT the official CISI volumes published by Parpola et al.

This is an independent open digitization of CISI data, created by Michael Carlson (2024)
and released under the MIT License.

## Upstream source

- Repository: https://github.com/mayig/indus-valley-script-corpus
- Commit: ad2f1e218a34b8c33c57de0d6cb8d99272765bbb (main branch, 2024)
- License: MIT (Copyright 2024 Michael Carlson) - see CORPUS_LICENSE.txt
- Acknowledgements: Dr Asko Parpola (CISI); Dr Andreas Fuls; Bryan K Wells

## Coverage

- Site: Mohenjo-daro only (CISI M- prefix convention)
- Artefact range: M-1 through M-199 (179 JSON files, WIP)
- The complete CISI covers multiple sites and thousands of artefacts.

## Sign notation

Sign identifiers use Parpola/CISI notation (P-NNN), not Mahadevan notation (M-NNN).

## Data fields available

- Artefact CISI ID (e.g. M-1, M-4)
- Side label (A, B, embedded in the id field as M-1A)
- Object type description (e.g. unicorn I seal)
- Sign sequence (ordered list of CISI sign IDs)
- Grapheme feature vectors (numeric, stored verbatim)

## Data fields NOT available

- Material (stone, faience, terracotta, etc.)
- Field symbol as a structured field
- Geographic sub-site coordinates
- Multi-line inscriptions
- Any decipherment, translation, or phonetic reading

## Download date

2026-08-30 (YYYY-MM-DD)
