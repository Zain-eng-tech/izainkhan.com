# izainkhan.com — Personal Website

A premium multi-page portfolio for Muhammad Zain Ul Abideen.
Static files only (HTML + CSS + JS), no build step, no database.
Theme: warm paper + deep navy + gold, Fraunces serif headings.

## Pages
- `index.html` — Home: hero with photo, stats, about, research preview, certificates preview
- `resume.html` — Full CV, section by section, matching the official resume PDF
- `research.html` — Thesis deep dive, publication, manuscripts, peer review
- `certificates.html` — Certificate gallery; each certificate opens on its own page
- `cert-eou.html`, `cert-adlm.html`, `cert-bsi.html`, `cert-mental-health.html` — certificate detail pages (full image + download)
- `cert-uol.html`, `cert-uhs.html` — PDF certificate pages (embedded viewer + download)
- `contact.html` — Contact cards, affiliation, references

## Files
- `styles.css` — the whole premium theme
- `script.js` — mobile menu, scroll reveal, footer year
- `assets/Zain_Edu_Resume.pdf` — CV download
- `assets/img/` — photo, lab graphic, GSN logo, certificate images
- `assets/certs/` — UOL + UHS certificate PDFs

## Put it live (free, ~10 minutes)
1. Open https://app.netlify.com/drop (free account if asked).
2. Drag the `izainkhan-website` folder onto the page. You get a live link.
3. Site settings → Domain management → Add custom domain → `izainkhan.com`, then add the DNS records it shows at your Northwest domain panel.

## Editing later
Each page is a separate file. Keep the header nav and footer identical across pages when editing. Content follows the official resume (~/workspace/user/files/Zain_Edu_Resume.pdf).
