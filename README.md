# File Manager & Manga Downloader

A full-stack application that combines file management, manga downloading, and reading capabilities. Built with React, Express, and Playwright for web scraping.

![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)
![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-green.svg)

---

## 🎯 Features

### File Manager
- **Browse Folders & Files**: Navigate through your file system with an intuitive UI
- **View File Details**: Display file sizes, modification dates, and file types
- **Download Files**: Download files directly to your device
- **File Icons**: Visual representation with appropriate icons for different file types
- **Active Path Display**: Always see your current location in the file system

### Manga Downloader
- **Multi-Site Support**: Download manga from:
  - MangaDex
  - Namicomi
  - Sequential Image sources
- **Real-time Progress Tracking**: WebSocket-based progress updates during downloads
- **Automatic Image Organization**: Downloaded images organized in safe folder structures
- **Temporary Storage**: Downloads saved to temp folder for management
- **Save Downloaded Manga**: Persist favorite manga to your library

### Manga Reader
- **View Saved Manga**: Browse your downloaded manga collection
- **Horizontal & Vertical View Modes**: Switch between viewing layouts
- **Page Navigation**: Jump between pages in manga
- **Responsive Design**: Works on desktop and mobile devices

### Video Player
- **Built-in Video Support**: Play videos directly in the app
- **Responsive Video Player**: Full-screen and embedded modes

---

## 🛠️ Tech Stack

### Frontend
- **React** 19.2 - UI library
- **Vite** 7.3 - Build tool and dev server
- **React Router DOM** 7.13 - Routing
- **Tailwind CSS** 4.2 - Styling
- **DaisyUI** 5.5 - Component library
- **Framer Motion** 12.35 - Animations
- **React Icons** 5.6 - Icon library
- **Axios** 1.13 - HTTP client

### Backend
- **Express** 5.2 - Web framework
- **Node.js** - JavaScript runtime
- **Playwright** 1.58 - Web scraping & browser automation
- **Cheerio** 1.2 - DOM parsing
- **WebSocket (ws)** 8.19 - Real-time communication
- **CORS** 2.8 - Cross-origin requests
- **dotenv** 17.3 - Environment variables

### Testing
- **Playwright** - End-to-end testing
- **Jest** - Test runner

---

## 📦 Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

### Clone the Repository
```bash
git clone https://github.com/Wasib-2005/React-Express-Folder-Manager.git
cd file-manager
```

### Install Dependencies
```bash
npm install
```

This command will automatically install dependencies for both frontend and backend.

---

## 🚀 Running the Application

### Development Mode
Run both frontend and backend concurrently:
```bash
npm run dev
```

The app will start with:
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:3000 (Express server)

### Frontend Only (Development)
```bash
npm run frontend
```

### Backend Only (Development)
```bash
npm run backend
```

### Production Build & Run
```bash
npm start
```

This will:
1. Build the frontend for production
2. Run the built frontend on preview server
3. Start the backend server

---

## 📁 Project Structure

```
file-manager/
├── frontend/                          # React application
│   ├── src/
│   │   ├── Components/
│   │   │   ├── FileManager/          # File browsing components
│   │   │   ├── Manga/                # Manga features
│   │   │   │   └── Downloader/       # Download UI components
│   │   │   └── NavBar/               # Navigation components
│   │   ├── Pages/
│   │   │   ├── Home.jsx              # File manager page
│   │   │   ├── MangaDownloader.jsx   # Download page
│   │   │   └── MangaReader.jsx       # Reader page
│   │   ├── Utilities/                # Helper utilities
│   │   └── App.jsx                   # Main app component
│   ├── package.json
│   └── vite.config.js
│
├── backend/                           # Express server
│   ├── src/
│   │   ├── controllers/              # Route handlers
│   │   │   ├── filepath.controller   # File operations
│   │   │   ├── browserFinder.controller # Manga download
│   │   │   └── mangaList.controller  # Saved manga list
│   │   ├── routes/                   # API routes
│   │   ├── utilities/
│   │   │   ├── mangaDownloader/     # Scraping utilities
│   │   │   └── ...                  # File operations
│   │   ├── WebSockets/              # Real-time updates
│   │   ├── Storages/                # Downloaded files
│   │   ├── app.js                   # Express setup
│   │   └── server.js                # Server entry point
│   ├── package.json
│   └── playwright.config.js
│
├── Playwright/                        # E2E testing
│   ├── cloud/
│   ├── index.js
│   └── package.json
│
└── package.json                       # Root package config
```

---

## 🔌 API Endpoints

### File Manager
- `GET /api/paths?path=<folderPath>` - Browse folder contents
- `GET /api/file/*` - Download files

### Manga Downloader
- `POST /api/browser/find` - Download manga from URL
- `GET /api/manga/list` - Get saved manga list

### WebSocket
- Real-time progress updates during downloads

---

## ⚙️ Configuration

Create `.env` files in the root, backend, and frontend directories:

### Backend `.env`
```env
DEFAULT_PATH=/data/data/com.termux/files/home
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
MANGA_MANHUA_DOWNLOAD_PATH=./src/Storages/manga
PORT=3000
```

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 📜 Git Commit History

Recent commits show the development progression:

```
55d9ff7 - feat: rename foundImgs to foundManga and implement saveManga
f27fdbe - feat: add manga list and reader routing
1b574f2 - refactor: update manga downloader functionality and improve UI
55bee78 - manga downloader viewer added
401d827 - manga downloader for mangadex and namicomi added
5853aa0 - manga showing in frontend
77043df - file download, img view and download done
aa1e559 - file manager nav done
b58ea09 - file manager layout finished
```

---

## 🧪 Testing

Run Playwright E2E tests:
```bash
npm run playwright
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **ISC License** - see the LICENSE file for details.

---

## 🔗 Links

- **GitHub Repository**: [React-Express-Folder-Manager](https://github.com/Wasib-2005/React-Express-Folder-Manager)
- **Issues**: [Report Issues](https://github.com/Wasib-2005/React-Express-Folder-Manager/issues)

---

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the project maintainers.

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Playwright Documentation](https://playwright.dev)
- [Vite Guide](https://vitejs.dev)

---

**Happy coding! 🚀**