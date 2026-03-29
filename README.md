# FØNIKS

This project is now a Node.js, Express, and SQLite editorial site.

## Stack

- Node.js
- Express
- EJS templates
- SQLite
- Shared CSS and JS assets

## Run

```bash
npm install
npm run db:init
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Windows Launcher

Double-click `Launch FONIKS.cmd` to:

- install dependencies if needed
- initialize the database if needed
- start the local server
- open the landing page in your browser

## Structure

- `server.js` boots the app
- `src/db` handles schema and seeding
- `src/routes` contains route definitions
- `src/repositories` contains content queries
- `views` contains layout partials and page templates
- `public` contains CSS and browser JS

## Notes

- `data/seed.json` is the canonical seed source for the database.
- `data/foniks.sqlite` is generated runtime data and is ignored by git.
- Images and article links remain external URLs for now, as requested.
