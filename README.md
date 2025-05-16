## Frontend app basic guide (Vue + Vite)

### Prerequisites

* [Node.js](https://nodejs.org/) (version 20.x or newer recommended)
* [npm](https://www.npmjs.com/) (comes with Node.js)

### Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run the development server**

   ```bash
   npm run dev
   ```

   The app should now be running at:
   [http://localhost:5173](http://localhost:5173)

3. **Build for production**

   ```bash
   npm run build
   ```

   The output will be in the `dist/` directory.

4. **Preview the production build (optional)**

   ```bash
   npm run preview
   ```

---

### Additional Scripts

| Script           | Description                    |
| ---------------- | ------------------------------ |
| `npm run lint`   | Lint the code using ESLint     |
| `npm run format` | Format code using Prettier     |
| `npm run test`   | Run unit tests (if configured) |

---

### Project Structure (Typical Vite + Vue)

```
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, icons
│   ├── components/      # Vue components
│   ├── pages/           # Pages components
│   ├── router/          # SPA Routing
│   ├── services/        # API services
│   ├── App.vue          # Root component
│   └── main.js          # App entry point
├── .env                 # Environment variables
├── index.html           # HTML entry
├── package.json         # Project metadata & scripts
├── vite.config.js       # Vite config
```
