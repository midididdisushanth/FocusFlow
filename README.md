🌊 FocusFlow - Daily Consistency Planner

FocusFlow is a modern, glassmorphism-styled productivity application designed to help users build consistency through daily task management, habit tracking, and wellness monitoring. Built with React and backed by Firebase.

🔗 Live Demo: https://midididdisushanth.github.io/FocusFlow/

✨ Key Features

📝 Smart Planner

Task Management: Add, edit, and delete daily tasks.

Bulk Mode: Quickly add multiple tasks at once (one per line).

Progress Tracking: Mark tasks as complete with satisfying animations.

Clear Done: One-click cleanup for completed items.

🔥 Habit Tracker

Streak System: Track daily streaks for habits like "Read Book" or "Drink Water".

Visual History: View the last 7 days of activity for each habit.

Daily Reset: Simulates a new day to reset daily progress while keeping streaks alive.

📊 Analytics Dashboard

Interactive Pie Chart: Visual breakdown of Tasks vs. Habits vs. Remaining items.

Consistency Score: A real-time calculated score (0-100%) based on your daily completion rate.

📅 Consistency Calendar

Visual History: A monthly view of your performance.

Color Coded:

🟢 Dark Green: 100% Completion (Perfect Day)

🟢 Medium Green: >50% Completion

🟢 Light Green: <50% Completion

🌱 Wellness Hub

Spider Graphs: Visualize the benefits of Mental Well-being, Food Habits, and Exercise.

Actionable Tips: Get specific advice for improving focus, energy, and mood.

🔐 Secure Authentication

Firebase Auth: Supports Email/Password signup and Guest (Anonymous) login.

Cloud Sync: All data is stored securely in Firestore, allowing access from multiple devices.

🛠️ Tech Stack

Frontend: React (Vite)

Styling: Tailwind CSS (Glassmorphism & Gradients)

Icons: Lucide React

Backend: Firebase Authentication & Firestore Database

Hosting: GitHub Pages

🚀 Getting Started Locally

Follow these steps to run the project on your machine:

Clone the repository:

git clone [https://github.com/midididdisushanth/FocusFlow.git](https://github.com/midididdisushanth/FocusFlow.git)
cd FocusFlow


Install dependencies:

npm install


Start the development server:

npm run dev


Open your browser:
Navigate to http://localhost:5173.

⚙️ Configuration

This project uses Firebase for data storage. If you want to use your own database:

Create a project at Firebase Console.

Enable Authentication (Email/Password & Anonymous).

Enable Firestore Database.

Replace the firebaseConfig object in src/App.jsx with your own keys.

📦 Deployment

This project is configured for GitHub Pages.

To deploy updates:

npm run deploy


Note: Ensure vite.config.js has the correct base path set to your repository name.

📸 Screenshots

(You can upload screenshots of your app here later to make the README pop!)

Made with ❤️ by Sushanth
