# ATS Resume Optimizer

A full-stack web application that helps users optimize their resumes for Applicant Tracking Systems (ATS).

## Features

- **Resume Upload**: Upload resumes in PDF or TXT format
- **ATS Score**: Get an instant compatibility score (0-100)
- **AI Optimization**: Receive AI-generated optimized versions
- **Suggestions**: Get actionable improvement recommendations
- **Missing Keywords**: View keywords to add for better ATS compliance
- **Share**: Share your results on social media
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18
- Vite
- Axios
- CSS3

### Backend
- Node.js + Express
- MongoDB
- Multer (file uploads)

### Database
- MongoDB Atlas (cloud) or local MongoDB

## Project Structure

```
ats-resume-optimizer/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── package.json
│   └── index.html
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   ├── controllers/        # Request handlers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── server.js          # Main server file
│   ├── package.json
│   └── .env.example
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB URI and other config:
```
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_api_key
PORT=5000
CLIENT_URL=http://localhost:3000
```

5. Start the backend server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. In a new terminal, navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Resume Upload
- **POST** `/api/resume/upload`
- Upload a resume file and get instant analysis

### Get Resume Score
- **GET** `/api/resume/:resumeId`
- Retrieve stored resume analysis

### Optimize Resume
- **POST** `/api/resume/:resumeId/optimize`
- Generate an optimized version with AI enhancements

### Health Check
- **GET** `/api/health`
- Check server status

## How It Works

1. **Upload**: User uploads a resume (PDF or TXT)
2. **Analysis**: Backend parses the file and calculates ATS score
3. **Feedback**: Frontend displays score, suggestions, and missing keywords
4. **Optimization**: User can generate an optimized version
5. **Download/Share**: User can download or share results

## ATS Score Calculation

The ATS score is based on:
- Presence of relevant keywords (JavaScript, Python, React, Node.js, etc.)
- Resume formatting and structure
- Length and completeness
- Use of proper terminology

Score ranges:
- **80-100**: Excellent - Highly ATS compatible
- **60-80**: Good - Decent ATS compatibility
- **Below 60**: Needs improvement - Follow suggestions

## Monetization (Future)

- **Google AdSense**: Banners on results and share pages
- **LinkedIn/Reddit Promotion**: Target Indian dev communities
- **Premium Features**: Advanced AI optimization (future)
- **Affiliate Programs**: Partner with job platforms

## Future Enhancements

- [ ] PDF text extraction improvements
- [ ] AI-powered resume writing using Groq/OpenAI
- [ ] User accounts and resume history
- [ ] Job description matching
- [ ] Cover letter generator
- [ ] Interview prep integration
- [ ] Mobile app version
- [ ] Real-time collaboration

## Environment Variables

```
MONGODB_URI          # MongoDB connection string
GROQ_API_KEY         # Groq API key for AI features (optional)
PORT                 # Server port (default: 5000)
NODE_ENV             # Environment (development/production)
CLIENT_URL           # Frontend URL for CORS
```

## Running in Production

1. Build frontend:
```bash
cd client
npm run build
```

2. Deploy built files to hosting (Vercel, Netlify, etc.)

3. Deploy backend to (Render, Railway, Heroku, AWS, etc.)

4. Update environment variables in production

## License

ISC

## Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for developers**
