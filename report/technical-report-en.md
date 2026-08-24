# Common Ground / Leeds — Supplementary Technical Report

**Project URL:** https://opalus12138.github.io/chen/
**Module:** GEOG5870 Web-Based GIS
**Word count:** 938 words, including headings and references

## 1. Problem overview

Common Ground / Leeds is an exploratory Web GIS website showing the distribution and recorded scale of public green spaces across Leeds. A spreadsheet or static list can name sites, but it cannot communicate the city-wide pattern or make comparison easy. The project therefore provides an accessible map for residents, students and local planners to explore where green spaces are recorded, what types they represent and which sites have the largest recorded areas. It is deliberately an exploratory prototype: spatial proximity is not treated as proof of walking accessibility, quality, safety or health impact.

## 2. Requirements and use cases

The assessment brief requires a functioning map-led website using HTML, CSS, JavaScript and Leaflet, supported by explanatory material and correctly cited data. From this requirement, the main use case was defined as follows: a non-specialist visitor should be able to understand the purpose of the project, view the full Leeds pattern, search for a named space, filter by typology, compare recorded areas and inspect a site without needing GIS software.

The interface therefore includes a narrative introduction, a Leaflet map, a category selector, case-insensitive search, popups, a reset action, summary statistics, a category composition chart, a ranked list of the five largest recorded spaces, and a map-emphasis switch between types and area. Selecting a category in the chart updates the map as well as the map controls. Selecting a ranked space moves the map to that feature, highlights it and opens its popup. The page also includes data credits, a limitations note, keyboard focus styles, responsive layout rules and a reduced-motion mode.

## 3. Data and methods

The dataset was obtained from Leeds City Council’s Public Green Spaces ArcGIS REST feature service. The service returns up to 1,000 records per request, so two paginated requests were used to retrieve all 1,781 records. Geometry was requested in WGS84 for direct Leaflet use. The local GeoJSON preserves the site name, source identifier, ward, recorded area, ownership and maintenance fields, while the source typology codes were translated into readable category labels. No category was inferred from an attractive name, and missing optional values are displayed as “Not available”.

The browser loads the local GeoJSON once. JavaScript keeps the complete feature array and derives a filtered view from the selected category and search query. Leaflet redraws the visible GeoJSON layer after each change. The summary values are recalculated from the visible features, including count, unique categories and the sum of known area values.

The map has two visual modes. The Types mode gives the layer a consistent moss-green style. The Area mode applies a sequential light-to-dark green treatment: under 5 hectares, 5–20 hectares and over 20 hectares, with a separate light treatment when area is missing. This is a magnitude encoding rather than a claim about site quality. The map legend explains the thresholds, while numbered markers identify the five largest polygon features. These markers are duplicated in the ranked list to provide a second route to the same information.

## 4. Technologies and design rationale

Semantic HTML provides headings, labels, lists and landmarks. CSS creates an editorial visual system using warm paper tones, dark green ink, a restrained amber accent, serif display typography and a responsive asymmetric layout. Vanilla JavaScript was chosen to keep the assessed programming visible and to avoid making an external charting framework the main part of the work. Leaflet was selected because it supports tiled basemaps, GeoJSON styling, popups, fitting bounds and keyboard-aware controls with a small client-side footprint.

The site is hosted as static files through GitHub Pages, which is sufficient for the current scope and avoids authentication, database credentials and server-side attack surface. Popup values are HTML-escaped before insertion. The page does not collect names, locations or other user-submitted data, and no API keys are stored in the repository.

## 5. Problems, limitations and future work

The largest implementation issue was the ArcGIS record limit, resolved through pagination. A second issue was the use of abbreviated typology codes, resolved by checking the service field metadata before normalising categories. Polygon density can make the city-wide map visually busy, so the site provides filtering, area emphasis, transparency and ranked navigation rather than claiming that every shape is equally legible at every zoom.

The dataset records mapped spaces, not current access conditions. It does not establish entrances, walking time, slope, maintenance, perceived safety, user numbers or unrestricted public access. The reported area is a source attribute and should not be confused with an independently measured accessibility or ecological indicator. The service metadata does not state a separate layer licence; final publication should therefore remain subject to Leeds City Council’s open-data terms.

Future development could add a pedestrian-network analysis for five-, ten- and fifteen-minute catchments, population and deprivation comparisons, entrance and facilities audits, update timestamps and automated checks for changed council records. A future version could also provide an accessible table download and compare provision across wards without presenting correlation as causation.

## References

Leeds City Council (n.d.) *Public Green Spaces*. ArcGIS REST Services. Available at: https://mapservices.leeds.gov.uk/arcgis/rest/services/Public/Customer_Contact/MapServer/10 and https://www.leeds.gov.uk/opendata/terms-and-licences (Accessed: 24 August 2026).

OpenStreetMap contributors (2026) *OpenStreetMap*. Available at: https://www.openstreetmap.org/copyright (Accessed: 24 August 2026).

Leaflet (2025) *Leaflet: an open-source JavaScript library for mobile-friendly interactive maps*. Available at: https://leafletjs.com/ (Accessed: 24 August 2026).

## GenAI acknowledgement

I acknowledge the use of Claude Code 2.1.241, using GPT-5.6-sol (Anthropic, https://claude.ai/code/), to assist with requirements interpretation, code drafting, visual refinement and technical-report editing. All data-source choices, outputs and final submission materials were reviewed and verified by the author.
