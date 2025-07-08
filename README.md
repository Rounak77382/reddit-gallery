# Reddit Gallery

A modern, responsive Reddit media gallery built with Next.js that transforms Reddit browsing into a beautiful, Pinterest-style visual experience. Browse your favorite subreddits with smart layout optimization, secure authentication, and real-time media streaming.

**🌐 Live Demo**: [reddit-gallery-real.vercel.app](https://reddit-gallery-real.vercel.app)

<img src="public/icons/test_out_33.png" alt="Reddit Gallery Preview" width="250">

## ✨ Features

- **🎨 Beautiful Gallery Layout**: Pinterest-style responsive grid with smart scaling
- **🔐 Secure OAuth Authentication**: Reddit OAuth 2.0 with encrypted token storage
- **📱 Mobile-First Design**: Fully responsive across all devices
- **⚡ Real-time Streaming**: Efficient media loading with generator functions
- **🔍 Advanced Search**: Search subreddits with auto-suggestions
- **📊 Interactive Voting**: Upvote/downvote posts directly from the gallery
- **🎯 Smart Filtering**: Filter by hot, top, new, rising posts with time ranges
- **📚 Search History**: Automatic tracking of visited subreddits
- **🔞 NSFW Toggle**: Safe content filtering for adult users
- **🌙 Dark Mode**: Elegant dark theme optimized for media viewing
- **🎬 Multi-Media Support**: Images, videos, GIFs, and Reddit galleries

## 🚀 Tech Stack

- **Frontend**: [Next.js 15.1.0](https://nextjs.org/) with React 19
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for responsive design
- **Authentication**: Reddit OAuth 2.0 with secure token management
- **Reddit API**: [Snoowrap](https://github.com/not-an-aardvark/snoowrap) wrapper
- **State Management**: React Context API with useReducer
- **Security**: CryptoJS for encrypted data storage
- **Caching**: Node-cache for optimized API requests
- **Media Processing**: Custom fetchers for Reddit, RedGifs, and more
- **Deployment**: [Vercel](https://vercel.com) with edge functions

## 📦 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/reddit-gallery.git
cd reddit-gallery
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a .env file in the root directory:

```env
praw_api_client_id=your_reddit_client_id
praw_api_client_secret=your_reddit_client_secret
NEXT_PUBLIC_ENCRYPTION_KEY=your_32_character_encryption_key
```

**Getting Reddit API Credentials:**

1. Visit [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Choose "web app" as the app type
4. Set redirect URI to `http://localhost:3000/api/auth/callback`
5. Copy the client ID (under the app name) and secret and paste it in the .env file

**Generating Encryption Key:**

The `NEXT_PUBLIC_ENCRYPTION_KEY` should be a random 32-character string used to encrypt sensitive data. You can generate one using:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Or create your own 32-character random string
# Example: A7F3D8E9B2C4G6H1J5K9L0M3N4P7Q2R8
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Architecture

```
reddit-gallery/
├── app/
│   ├── _components/                    # React Components
│   │   ├── AppContext.js               # Global state management
│   │   ├── Header.js                   # Navigation & search
│   │   ├── Sidebar.js                  # History & subreddit list
│   │   ├── MediaCard.js                # Individual post cards
│   │   ├── GalleryContent.js           # Main gallery container
│   ├── _lib/                           # Core Libraries
│   │   ├── RedditMediaFetcher.js       # Reddit API integration
│   │   ├── OptimalLayoutCalculator.js  # Grid optimization
│   │   ├── SubredditSearchService.js   # Search functionality
│   │   ├── PopularSubredditsService.js # Popular content
│   │   └── RedditAuthService.js        # Authentication logic
│   ├── api/                            # API Routes
│   │   └── auth/                       # OAuth endpoints
│   │       ├── authorize/              # OAuth initiation
│   │       └── callback/               # OAuth callback
│   ├── globals.css                     # Global styles
│   ├── layout.js                       # Root layout
│   └── page.js                         # Home page
├── public/                             # Static assets
│   ├── icons/                          # App icons
│   └── fonts/                          # Custom fonts
└── ...configuration files
```

## 🎯 Key Features Deep Dive

### 🧠 Smart Layout System

The `OptimalLayoutCalculator` uses advanced algorithms to:

- Dynamically calculate optimal scaling ratios
- Minimize gaps in the grid layout
- Adapt to different screen sizes and media aspect ratios

### 🔒 Secure Authentication Flow

- OAuth 2.0 implementation in `/api/auth` endpoints
- Encrypted token storage using `AppContext`
- Automatic token refresh and validation
- Secure cookie management with encryption

### ⚡ Efficient Media Streaming

- Generator functions in `RedditMediaFetcher` for memory-efficient loading
- Smart caching with `node-cache` for reduced API calls
- Progressive loading with loading states and shimmer effects

### 📱 Responsive Media Cards

- Adaptive `MediaCard` components
- Smart hover effects based on card position
- Support for images, videos, galleries, and external media

## 🔧 Configuration

### Environment Variables

| Variable                     | Description              | Required | Example                            |
| ---------------------------- | ------------------------ | -------- | ---------------------------------- |
| `praw_api_client_id`         | Reddit API client ID     | ✅       | `AbCdEf123456`                     |
| `praw_api_client_secret`     | Reddit API client secret | ✅       | `xyz789-secret-key`                |
| `NEXT_PUBLIC_ENCRYPTION_KEY` | 32-char encryption key   | ✅       | `my-super-secret-32-character-key` |

### Customization Options

- **Themes**: Modify `globals.css` and tailwind.config.mjs
- **Layout**: Adjust algorithms in `OptimalLayoutCalculator.js`
- **Media Support**: Extend in `RedditMediaFetcher.js`
- **Search**: Configure caching in `SubredditSearchService.js`

## 📝 Available Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build optimized production bundle
npm run start    # Start production server
npm run lint     # Run ESLint for code quality
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**

   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in project settings
   - Deploy automatically on every push

3. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all required environment variables
   - Redeploy if needed

### Manual Deployment

```bash
npm run build
npm run start
```

### Development Guidelines

- Follow the existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

## 📊 Performance & Optimization

- **Caching**: Multi-layer caching strategy for API responses
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Dynamic imports for better loading performance
- **Edge Functions**: Vercel edge functions for global performance
- **Memory Management**: Generator functions prevent memory leaks

## 🔐 Security Features

- **Encrypted Storage**: All sensitive data encrypted with CryptoJS
- **Secure Cookies**: HTTPOnly, Secure, SameSite cookie attributes
- **CSRF Protection**: State parameter validation in OAuth flow
- **Content Security Policy**: Configured headers for XSS prevention
- **Input Sanitization**: All user inputs properly sanitized

## 🙏 Acknowledgments

- [Reddit API](https://www.reddit.com/dev/api/) for providing the data
- [Snoowrap](https://github.com/not-an-aardvark/snoowrap) for the excellent Reddit API wrapper
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vercel](https://vercel.com/) for seamless deployment

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/your-username/reddit-gallery/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/reddit-gallery/discussions)
- **Live App**: [reddit-gallery-real.vercel.app](https://reddit-gallery-real.vercel.app)

---

⭐ **If you found this project helpful, please give it a star!**

_Built with ❤️ by the community for Reddit enthusiasts_



