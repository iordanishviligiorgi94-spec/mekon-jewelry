# MEKON Jewelry

One-page Georgian jewelry landing page. No build step or runtime dependencies.

Run `npm run dev`, then open http://127.0.0.1:4173. Run `npm run check` for source and asset validation. Deploy `dist/` as a static website.

The landing includes a responsive mega menu, the animated butterfly pendant intro, all 19 original MEKON products, category filters, search, product previews, browser-local favorites, and links to the existing Instagram order flow. There is no checkout or order backend.

Product content, photos, social links and payment details come from https://mekon-jewelry.vercel.app/. The hero uses the user-approved front image generated with Nano Banana 2.1 on Freepik/Magnific (creation 4Rat48E9Aa), matching the airy composition of the requested https://oberig.jewelry/en reference. Three WebP sizes are encoded from the unchanged 4096px master. Navigation layout follows the requested Jenny Bird reference with MEKON categories. All images and fonts are served locally.

The hero uses CSS image blending and a small canvas overlay in `dist/pendant-hero.js`: highlights are anchored to specific crystal facets, diamonds and gold edges. A gentle float and mouse tilt keep image and highlights aligned. Animation stops off-screen, in hidden tabs, and on pause; reduced-motion preferences start with a static image. No animation libraries or model downloads are needed. The original ring files remain as unused reference assets.

Edit product information in `dist/assets/products.json`, layout in `dist/index.html`, appearance in `dist/styles.css`, and interactions in `dist/app.js`. Sites identity is stored in `.openai/hosting.json`.

The header and footer use `dist/assets/mekon-logo.png`, a transparent uppercase MEKON calligraphic wordmark created with the built-in Imagegen tool from the supplied lettering reference. The original generated PNG is retained without raster processing; CSS frames its transparent margins for each responsive placement. The generation prompts are recorded in `logo-prompts.txt`.

Georgian typography uses MCh NeoBau Regular and Bold by Mariam Chachanidze, downloaded from https://typeface.ge/ka/font/MCh+NeoBau. The original font files and source attribution are in dist/assets/fonts/. Typography sizes and weights are maintained in dist/typography.css; body text and shopping controls are sized for readability. Conversion improvement has not been measured.
