# 📚 BookReader

An intelligent, production-ready PDF reading web application built with React. It provides a seamless reading experience with advanced features like AI-powered context assistance, persistent reading state, and a beautiful dark-themed UI.

## ✨ Features

- **Robust PDF Rendering:** Powered by `react-pdf` (Mozilla's PDF.js wrapper) for fast and accurate document display.
- **AI Reading Assistant:** Integrated with Google Gemini AI. Select any text in the PDF to instantly get definitions, simple explanations, or deeper context.
- **Smart Navigation:** Features a collapsible Table of Contents sidebar automatically extracted from your PDFs.
- **Reading State Persistence:** Automatically saves your last read page, zoom level, and a history of recently opened books using local storage.
- **Google Authentication:** Secure login powered by Firebase Authentication.
- **Premium UI/UX:** A modern, distraction-free dark mode interface with glassmorphic elements and smooth animations.

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite
- **Styling:** Vanilla CSS with Custom Properties (CSS Variables)
- **PDF Engine:** `react-pdf` (PDF.js)
- **Authentication:** Firebase (Google Sign-In)
- **AI Integration:** Google Generative AI (`@google/generative-ai` using `gemini-2.0-flash-lite`)
- **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (v18+ recommended) installed on your system.

### Installation

1. **Clone the repository** (if applicable) or navigate to the project folder:
   ```bash
   cd book-reader
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Rename the provided `.env.example` file to `.env` (or create a new `.env` file in the root directory).
   Fill in your Firebase and Gemini credentials:
   
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Google Gemini AI Key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 📖 How to Use

1. **Sign In:** Use your Google account to log into the application.
2. **Open a Book:** Click the "Open PDF" button in the top toolbar or drag and drop a PDF file directly onto the viewer area.
3. **Navigate:** Use the arrow keys, the page input box, or the Table of Contents in the sidebar to jump around the document.
4. **Use AI Assistant:** 
   - Click the **AI Assistant** button in the header to open the side panel.
   - Select any text inside the PDF document.
   - Choose a quick action (Summarize, Define, Simplify) or type a custom question in the chat box to interact with the AI about the selected context.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
