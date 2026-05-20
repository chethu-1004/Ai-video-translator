# AI Video Translator for Indian Languages

A full-stack web application that translates videos to Indian languages (Hindi, Kannada, Telugu, Tamil, Malayalam) using AI-powered speech recognition, translation, and text-to-speech synthesis.

![AI Video Translator](https://img.shields.io/badge/AI%20Powered-Sarvam%20AI-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-61DAFB)
![FFmpeg](https://img.shields.io/badge/FFmpeg-Required-orange)

## Features

- **5 Indian Languages**: Hindi, Kannada, Telugu, Tamil, Malayalam
- **AI-Powered Pipeline**: Sarvam AI APIs for Speech-to-Text, Translation, and TTS
- **22 Indian Languages**: Hindi, Kannada, Telugu, Tamil, Malayalam, and more
- **Real-time Progress**: WebSocket updates during processing
- **Subtitle Support**: Generate and toggle translated subtitles
- **Audio Sync Adjustment**: Fine-tune audio synchronization
- **Modern UI**: Glassmorphism design with Framer Motion animations
- **Responsive**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18 (Vite)
- Tailwind CSS
- Framer Motion
- Socket.io Client
- React Dropzone
- Lucide React Icons

### Backend
- Node.js + Express
- Socket.io
- Multer (file uploads)
- Fluent FFmpeg
- JWT Authentication

### AI/ML Processing
- **Sarvam AI APIs** (Required):
  - Speech-to-Text-Translate: Automatic transcription + translation
  - Text-to-Speech: Natural voice synthesis in 22 Indian languages
- **FFmpeg**: Video and audio processing

**Note**: Sarvam AI requires an API key. Get one free at https://dashboard.sarvam.ai/

## Prerequisites

Before running the application, ensure you have the following installed:

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   # Check version
   node --version
   
   # Install from: https://nodejs.org/
   ```

2. **FFmpeg** (Required for video processing)
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install ffmpeg
   
   # macOS (using Homebrew)
   brew install ffmpeg
   
   # Windows (using Chocolatey)
   choco install ffmpeg
   
   # Verify installation
   ffmpeg -version
   ```

3. **Python** (v3.8 or higher) with pip
   ```bash
   # Check version
   python3 --version
   pip3 --version
   ```

4. **Sarvam AI API Key** (Required)
   
   Get your free API key at: https://dashboard.sarvam.ai/
   
   See [SARVAM_SETUP.md](SARVAM_SETUP.md) for detailed setup instructions.

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-video-translator
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Install Python Dependencies

```bash
cd ../backend/src/scripts
pip install -r requirements.txt
```

### 5. Configure Environment Variables

#### Backend (.env)

```bash
cd ../../
cp .env.example .env
# Edit .env with your configuration
```

Add to your `.env`:
```
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
MAX_FILE_SIZE=104857600
SARVAM_API_KEY=your_sarvam_api_key_here
SARVAM_API_URL=https://api.sarvam.ai
```

**Note**: The application requires a Sarvam AI API key to function. See [SARVAM_SETUP.md](SARVAM_SETUP.md) for detailed instructions.

#### Frontend (.env)

```bash
cd ../frontend
cp .env.example .env
```

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Running the Application

### Development Mode

You need to run both the backend and frontend servers:

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

The frontend development server will start on `http://localhost:5173`

### Production Mode

#### Build Frontend

```bash
cd frontend
npm run build
```

#### Start Backend in Production

```bash
cd ../backend
npm start
```

## Project Structure

```
ai-video-translator/
├── backend/
│   ├── src/
│   │   ├── controllers/      # API controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── scripts/         # Python processing scripts
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Express server entry
│   ├── uploads/             # Uploaded videos (created automatically)
│   ├── outputs/             # Translated videos (created automatically)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React contexts
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Upload
- `POST /api/upload` - Upload video file
- `GET /api/upload/:jobId/info` - Get video metadata

### Processing
- `POST /api/process` - Start video translation
- `GET /api/process/jobs` - List all jobs
- `GET /api/process/:jobId/status` - Get job status
- `GET /api/process/:jobId/result` - Get job result
- `POST /api/process/:jobId/cancel` - Cancel job

### WebSocket Events
- `join-job` - Join a job room for updates
- `progress` - Receive progress updates

## Processing Pipeline

1. **Upload** - Video is uploaded and stored
2. **Audio Extraction** - FFmpeg extracts audio from video
3. **Transcription** - Whisper converts speech to text
4. **Translation** - IndicTrans translates text to target language
5. **TTS** - AI4Bharat TTS generates speech from translated text
6. **Merging** - FFmpeg merges new audio with original video
7. **Completion** - Final video is ready for download

## Configuration Options

### Advanced Translation Options

When starting a translation, you can configure:

- **Generate Subtitles**: Toggle subtitle generation
- **Subtitle Position**: Bottom or top placement
- **Audio Sync Adjustment**: Fine-tune audio synchronization (-500ms to +500ms)
- **Preserve Background Audio**: Keep original background sounds

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 5000 |
| `MAX_FILE_SIZE` | Maximum upload size in bytes | 104857600 (100MB) |
| `MAX_CONCURRENT_JOBS` | Parallel processing jobs | 2 |
| `WHISPER_MODEL` | Whisper model size | base |
| `CHUNK_DURATION_SECONDS` | Audio chunk size | 30 |

## Troubleshooting

### Common Issues

1. **FFmpeg not found**
   - Ensure FFmpeg is installed and in your PATH
   - Verify with: `ffmpeg -version`

2. **Whisper model download fails**
   - First run may download models (~150MB for 'base')
   - Ensure stable internet connection
   - Models are cached in `~/.cache/whisper/`

3. **Python dependencies not found**
   - Use `pip3` instead of `pip`
   - Ensure Python 3.8+ is installed
   - Consider using a virtual environment

4. **CORS errors in development**
   - Backend CORS is configured for `localhost:5173`
   - Frontend proxy is configured in `vite.config.js`

5. **File upload fails**
   - Check `MAX_FILE_SIZE` in backend .env
   - Ensure `/uploads` directory exists and is writable

### Performance Tips

- Use smaller Whisper models (`tiny`, `base`) for faster processing
- Process shorter videos first to test the pipeline
- Close other CPU-intensive applications during processing

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Sarvam AI](https://www.sarvam.ai/) - Indian language speech-to-text, translation, and TTS APIs
- [FFmpeg](https://ffmpeg.org/) - Video/audio processing
- [Framer Motion](https://www.framer.com/motion/) - Animations

## Support

For issues and feature requests, please open an issue on GitHub.

---

**Happy Translating!** 🎬🌐
