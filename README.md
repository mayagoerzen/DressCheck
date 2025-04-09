# Workwear Compliance Checker

A React-based web application that uses OpenAI's GPT-4o model to analyze whether a user's outfit is compliant with workplace dress codes — specifically for healthcare and construction industries.

Users can upload a photo or describe their outfit, select a workplace dress code, and receive an AI-powered compliance analysis with suggestions for improvement.

## Features

- Upload an outfit image or describe it in natural language
- Choose from predefined dress code policies (e.g., hospital, construction site)
- AI analysis using OpenAI API (GPT-4o)
- Compliance verdict and improvement suggestions
- Context-aware analysis using industry-specific terminology

## Tech Stack

- Frontend: React, HTML, CSS, JavaScript
- AI Backend: OpenAI GPT-4o API
- Platform: Built and deployed via Replit

## How to Run Locally

1. Clone this repository:
   git clone [https://github.com/your-username/workwear-checker.git](https://github.com/mayagoerzen/DressCheck)
   cd workwear-checker

2. Install dependencies:
   npm install

3. Add your OpenAI API key to a `.env` file:
   VITE_OPENAI_API_KEY=your-api-key-here

4. Run the app locally:
   npm run dev

## Live Demo

Check out the live app: https://dress-check-mcgoerzen1.replit.app/ 

## Sample Use Cases

- Compliant: “High-visibility vest, steel-toe boots, hard hat — compliant with construction site PPE standards.”
- Non-compliant: “Scrubs with exposed midriff and running shoes — does not meet healthcare uniform standards.”

## Project Structure

src/
├── components/     # React components
├── assets/         # Images and icons
├── api/            # OpenAI interaction logic
├── App.jsx         # Main app layout
├── index.html
└── main.jsx

## Team Members

- Maya Goerzen
- Avi Sethi
- Susan Wu
- Marie Brauer
- Lauren Bourgeois
- Course: ENTI 674 

## License

This project is for academic purposes as part of the University of Calgary’s ENTI 674 course.

## Feedback

We welcome feedback and suggestions. Please submit issues or feature requests using GitHub’s Issues tab.
