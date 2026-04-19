# Book & Stationery POS (Starter)

This repository now contains the starter implementation of a browser-based POS system for a book and stationery shop.

## Implemented features

- Login gate with credential check and session-based access
- Customer creation (name + phone)
- Sales entry with item type selection:
  - **Book**
  - **Stationery**
- Book-specific sale fields:
  - School
  - Grade
- Amount paid tracking and customer balance view
- Local persistence for customers and sales data in browser storage
- Mobile-friendly responsive layout for phone browsers

## Tech stack

- HTML
- CSS
- JavaScript (vanilla)

## Run locally

Since this is a static starter app, you can run it with any static file server.

Example:

```bash
cd odin-recipes
python3 -m http.server 8080
```

Then open:

- `http://localhost:8080/index.html`

Use demo credentials:

- Username: `admin`
- Password: `Admin#123`

## Notes

This is a starter implementation to begin development and can be extended with:

- Backend persistence (Node.js + database)
- Real authentication and authorization
- Sales history, inventory, and reporting

Current authentication/session handling is demo-only and not production secure.
