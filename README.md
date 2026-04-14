# StudentShield CyberSecurity Dashboard

A comprehensive cybersecurity dashboard built with React and FastAPI that provides various security tools and assessments.

## Features

### Security Tools
- **Password Strength Checker**: Analyzes password security and provides recommendations
- **URL Safety Scanner**: Checks URLs for malicious content and phishing risks
- **Email Security Scanner**: Detects phishing attempts and spam emails
- **File Safety Checker**: Scans files for malware and security threats
- **WiFi Security Analyzer**: Evaluates WiFi network security
- **Security Awareness Quiz**: Tests cybersecurity knowledge

### Dashboard Features
- **Dynamic Cyber Safety Score**: Real-time score calculation based on tool results
- **Total Safety Score**: Comprehensive security assessment
- **Scan History**: Track all security scans and results
- **Professional UI**: Dark cyber-security theme with smooth animations

## Tech Stack

### Frontend
- React 18
- TailwindCSS
- Lucide Icons
- React Router

### Backend
- FastAPI
- MongoDB
- JWT Authentication
- bcrypt for password hashing

## Installation

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
1. Install and start MongoDB
2. The application will automatically connect to MongoDB on `localhost:27017`
3. Database and collections will be created automatically

## Usage

1. Register a new account or login with existing credentials
2. Use various security tools from the dashboard
3. View your cyber safety score and recommendations
4. Track scan history and monitor security posture

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /auth/register` - Alternative register endpoint
- `POST /auth/login` - Alternative login endpoint

### Security Tools
- `POST /password-check` - Check password strength
- `POST /url-check` - Scan URL safety
- `POST /email-check` - Scan email security
- `POST /file-check` - Check file safety
- `POST /wifi-check` - Analyze WiFi security
- `POST /quiz` - Security awareness quiz

### Dashboard
- `GET /dashboard` - Dashboard data
- `GET /history` - Scan history
- `POST /safety-score` - Calculate safety score
- `POST /total-score` - Calculate total score

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Error handling and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Author

Pranali - [GitHub](https://github.com/pranal-dotcom)

## Acknowledgments

- FastAPI framework
- React ecosystem
- MongoDB database
- Open-source security libraries
