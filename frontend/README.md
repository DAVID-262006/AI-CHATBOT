# AI Chatbot Frontend

A modern, premium AI chatbot frontend built with React, Vite, Tailwind CSS, and Framer Motion.

## Features

- 🎨 Modern, clean UI with glassmorphism effects
- 🌙 Dark/Light mode toggle
- ⚡ Smooth animations with Framer Motion
- 📱 Fully responsive design
- 💬 Real-time chat with typing indicators
- 📋 Copy message functionality
- 🎯 Auto-scroll to latest messages
- 🔄 Message streaming effect
- 🎨 Gradient animated background
- 💫 Professional color palette

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Axios** - HTTP client for API calls

## Prerequisites

- Node.js (v16 or higher)
- Backend server running on `http://localhost:5000`

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

## API Integration

The frontend communicates with the backend API at `http://localhost:5000/api/v1/chat`.

### API Endpoints Used:
- `POST /chat` - Send a message
- `GET /chat/:id` - Get chat history
- `POST /chat/new` - Create new chat
- `GET /health` - Health check

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatInput.jsx      # Message input component
│   │   ├── ChatMessage.jsx    # Individual message component
│   │   └── Sidebar.jsx        # Sidebar with chat controls
│   ├── pages/
│   │   └── ChatPage.jsx       # Main chat interface
│   ├── services/
│   │   └── api.js             # API service functions
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # App entry point
│   └── index.css              # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

## Key Components

### ChatPage
- Main chat interface with sidebar toggle
- Handles chat initialization and message sending
- Manages loading states and error handling

### ChatMessage
- Displays individual messages with animations
- Implements typing effect for AI responses
- Includes copy functionality and timestamps

### ChatInput
- Message input with auto-resizing textarea
- Send button with loading states
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

### Sidebar
- Chat management (new chat, clear chat)
- Current chat information
- Feature list

## Styling

The app uses a modern design system with:
- **Glassmorphism**: Semi-transparent backgrounds with blur effects
- **Gradients**: Smooth color transitions for backgrounds and buttons
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Responsive**: Mobile-first design that works on all screen sizes

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Follow the existing code style
2. Use meaningful component and variable names
3. Add proper error handling
4. Test on multiple screen sizes
5. Ensure animations are smooth and not excessive

## License

This project is part of the AI Chatbot application.