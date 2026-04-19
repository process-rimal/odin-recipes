# Book & Stationery POS (Starter)

This repository now contains the starter implementation of a browser-based POS system for a book and stationery shop.

## Implemented features

- Secure login gate (password policy + session-based access)
- Customer creation (name + phone)
- Sales entry with item type selection:
  - **Book**
  - **Stationery**
- Book-specific sale fields:
  - School
  - Grade
- Amount paid tracking and customer balance view
- Mobile-friendly responsive layout for phone browsers

## Tech stack

- HTML
- CSS
- JavaScript (vanilla)

## Run locally

Since this is a static starter app, you can run it with any static file server.

Example:

```bash
cd /home/runner/work/odin-recipes/odin-recipes
python3 -m http.server 8080
```

Then open:

- `http://localhost:8080/index.html`

## Notes

This is a starter implementation to begin development and can be extended with:

- Backend persistence (Node.js + database)
- Real authentication and authorization
- Sales history, inventory, and reporting
