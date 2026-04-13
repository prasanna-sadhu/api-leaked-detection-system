# Framework for Leaked API Detection

## Project Overview
The API Key Leak Detection Framework is a security-focused system designed to automatically identify exposed API keys, secrets, and credentials from public sources such as GitHub repositories, paste sites, forums, and web pages. It helps prevent unauthorized access, data breaches, and financial fraud by detecting leaks early and generating alerts.

---

## Workflow

The system follows a multi-stage pipeline:

### 1. Data Collection
Public data is collected from sources like GitHub, paste sites, and web pages using web scraping (BeautifulSoup) or APIs.

### 2. Data Cleaning
Raw HTML/text data is cleaned by removing tags, symbols, and irrelevant content.

### 3. Detection Engine
The system uses a 3-layer detection approach:
- Regex Patterns → Identifies known API key formats (AWS, Google, Stripe, etc.)
- Entropy Analysis → Detects randomly generated secret-like strings
- Context Analysis → Validates whether the string is actually a credential

### 4. Risk Scoring
Each detected key is assigned a risk score based on:
- Type of API key
- Source of exposure
- Confidence level of detection

### 5. Classification
Detected keys are classified into service categories such as AWS, Azure, GCP, Stripe, etc.

### 6. Alert System
High-risk leaks trigger alerts (notifications or dashboard alerts).

### 7. Dashboard
A visualization dashboard displays:
- Detected leaks
- Risk levels
- Source URLs
- Affected services

---

## Key Features
- Multi-layer detection system (Regex + Entropy + Context)
- Risk scoring and classification engine
- Real-time alert generation
- Scalable architecture

---

## Tech Stack
Frontend: React, Axios  
Backend: Node.js, Express, Mongoose  
Detection: Python, Regex, SciPy  
Database: MongoDB  

---

