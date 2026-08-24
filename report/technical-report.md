# Common Ground / Leeds — Technical Progress Report

**Project URL:** https://opalus12138.github.io/chen/
**Module:** GEOG5870 Web-Based GIS

## Problem overview

Common Ground / Leeds is an exploratory website showing the distribution of recorded public green spaces across Leeds. Public open space supports recreation, informal social activity and contact with nature, but a list of sites does not communicate the spatial pattern clearly. The website turns the council dataset into an interactive map for residents, students and local planners. It is intended to prompt questions about provision rather than to claim that mapped proximity proves accessibility or health benefit.

## Requirements and use cases

The requirements were derived from the assessment brief and a simple public-user scenario: a visitor should be able to understand the project, view the city-wide pattern, find a named site and isolate a type of space without specialist GIS knowledge. The site therefore needed a clear introduction, readable map, category filter, name search, informative popups, summary figures, source information, responsive layout and visible error states. A client-side prototype was selected because it can be hosted as static files and does not collect personal data.

## Technologies and implementation

The site uses semantic HTML, custom CSS, vanilla JavaScript and Leaflet 1.9.4. This keeps the assessed technologies central and avoids a template or site generator. Leaflet renders an OpenStreetMap basemap and a local GeoJSON layer. The source is Leeds City Council’s Public Green Spaces polygon feature service. Its 1,781 records were retrieved in two paginated requests, requested in WGS84, reduced to the required attributes and assigned readable labels from the source typology codes. Geometry remains local so filtering does not depend on repeated network requests. The service metadata does not state a separate layer licence, so deployment should be checked against the council’s open-data terms before publication.

JavaScript keeps one source array and derives the visible features from category and case-insensitive name filters. Each redraw updates the feature count, category count and summed recorded area. Popups use escaped text and safe fallbacks for missing values. Invalid geometries are skipped, failed data requests reveal an inline message, and reset returns both the controls and map extent to their original state.

The visual design uses a restrained editorial approach rather than a dashboard template: warm paper tones, dark green map accents, serif headings, compact metadata and an asymmetric map-led layout. Responsive rules stack the controls above the map on narrow screens, while keyboard focus styles and reduced-motion handling support basic accessibility.

## Issues, security and limitations

The ArcGIS service limits responses to 1,000 records, so pagination was required. Source category values are abbreviated codes; these were translated using the service typology rather than inferred from names. The site has no login, database or form submission, which reduces security exposure. Text inserted into map popups is HTML-escaped, dependencies are version-pinned and no API keys are stored.

The dataset describes recorded polygons, not current site quality, entrances, walking routes or unrestricted public access. A large mapped area may therefore be nearby but difficult to enter. Recorded area is also an administrative attribute rather than an independent measurement. These limitations are stated on the website.

## Future work

A fuller project could calculate five-, ten- and fifteen-minute walking catchments using an accessible street network, compare provision with population and deprivation data, and audit entrances, paths and facilities. It could also add temporal updates and automated checks for changed council records.

## References

Leeds City Council (n.d.) *Public Green Spaces*. ArcGIS REST Services. Available at: [Leeds City Council Public Green Spaces service](https://mapservices.leeds.gov.uk/arcgis/rest/services/Public/Customer_Contact/MapServer/10) and [Leeds open-data terms and licences](https://www.leeds.gov.uk/opendata/terms-and-licences) (Accessed: 24 August 2026).

OpenStreetMap contributors (2026) *OpenStreetMap*. Available at: [OpenStreetMap copyright and licence](https://www.openstreetmap.org/copyright) (Accessed: 24 August 2026).

Leaflet (2025) *Leaflet: an open-source JavaScript library for mobile-friendly interactive maps*. Available at: [Leaflet project website](https://leafletjs.com/) (Accessed: 24 August 2026).

## GenAI acknowledgement

I acknowledge the use of Claude Code 2.1.241, using GPT-5.6-sol (Anthropic, https://claude.ai/code/), to assist with requirements interpretation, code drafting, visual refinement and technical-report editing. All data-source choices, outputs and final submission materials were reviewed and verified by the author.
