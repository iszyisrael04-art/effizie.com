# Effizie Hotel

A responsive static website for Effizie Hotel, using the hotel's existing photographs and supplied logo. Pages are Home, Rooms & Suites, Gallery, Our Story, Contact, and the enquiry receipt.

## Run locally

Serve this directory with any static HTTP server. JavaScript modules require HTTP rather than opening an HTML file directly. No build step or package installation is required.

## Reservations

The homepage passes dates and guest count to the contact form. Room links preselect the room. The existing Formspree endpoint receives enquiries; the website redirects only after the provider confirms success. On failure, the form keeps the entered details and offers phone/WhatsApp alternatives. This is an enquiry flow, not live inventory or payment processing. The hotel must confirm availability and rates.

Existing room rates and contact details have been retained. Update them in the HTML pages when the hotel changes them. The gallery uses only hotel photographs from this repository. The original supplied header logo is in `assets/effizie-logo.jpg`; header sizing is handled in CSS.

## Check

```sh
node --check scripts.js
node --check booking.mjs
node --test test/booking.test.mjs
```

The existing `.github/workflows/static.yml` publishes the root of the repository to GitHub Pages on pushes to `main`.
