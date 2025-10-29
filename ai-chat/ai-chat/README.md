# AI Agent Chat Application Documentation

## Overview

This project is an AI-powered chat application, similar to ChatGPT, built using React and Vite for fast development and optimized performance. It leverages local Ollama 3 CodeLlama models for conversational AI, ensuring privacy and speed by running all LLM inference locally. The application is engineered with modern React techniques to maximize efficiency and responsiveness.

## Features

- **Chatbot Experience:** Engage with an AI agent in natural language.
- **Local LLM Inference:** Uses Ollama 3 CodeLlama models locally—no cloud API calls required.
- **React Modern Optimization:** Built using best practices for component performance and state management.
- **Customizable and Extensible:** Easily modifiable for other local models or UI changes.

## Folder Structure

```
ai-chat/ai-chat/
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── robots.txt
├── sitemap.xml
├── tailwind.config.js
├── vite.config.js
├── public/
├── server/
└── src/
```

### Key Files & Directories

- `README.md`: Project intro and setup notes.
- `.gitignore`: Specifies files to ignore in version control.
- `eslint.config.js`: Code linting configuration for quality and consistency.
- `index.html`: Main HTML entry point.
- `package.json` & `package-lock.json`: NPM dependencies and scripts.
- `postcss.config.js`, `tailwind.config.js`: Styling configurations for TailwindCSS and PostCSS.
- `vite.config.js`: Vite build and dev server setup.
- `robots.txt`, `sitemap.xml`: SEO and crawler configs.
- `public/`: Static assets.
- `server/`: Backend or API server logic (if any).
- `src/`: Main React application source.

## Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **Ollama** installed and the CodeLlama model downloaded
- **npm** or **yarn**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/surajydsde/ai-agent
   cd ai-agent/ai-chat/ai-chat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Make sure Ollama is running with the CodeLlama model:
   ```bash
   ollama serve
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser at `http://localhost:5173` (default Vite port).

## Customization

- **React Optimization:** The app uses memoization, code splitting, and efficient state management for responsiveness.
- **Styling:** TailwindCSS and PostCSS allow rapid style changes.
- **Model Integration:** Modify backend/server logic to swap or enhance local models.

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is released under the MIT License.

## Support

For issues or feature requests, open a GitHub issue in this repository.

---

_This documentation describes the AI agent chat app using local Ollama CodeLlama models, optimized with React and Vite._
