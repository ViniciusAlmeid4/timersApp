# timersApp

This project is a simple timer management application built with Node.js, Express, WebSocket, and a frontend that utilizes Bootstrap and Bootstrap Icons. The app allows users to add, view, and delete timers, with a WebSocket connection that updates active timers in real-time for connected clients.

## Features
- Timer Management: Users can add timers with names and specific durations, either in hours or minutes.
- Real-time Updates: The WebSocket server broadcasts timer updates to connected clients, ensuring synchronized timer data.
- Notifications: When a timer ends, a sound alert and modal notification appear on the screen.
- User Interface: Bootstrap styling is used to create a responsive and user-friendly interface.

## Setup Instructions

### Prerequisites
- Node.js (20.17 recommended)
- npm (Node Package Manager)

### Step 1: Clone the Repository or download it
Clone the repository using git:
```
git clone https://github.com/ViniciusAlmeid4/timersApp/
cd meu-backend
```

OR

Download the source code in zip and decompact it in the desired folder

### Step 2: Install Dependencies
Run the following command in the projects terminal to install the required packages:
```
npm install
```

### Step 3: Set Up Environment Variables
Create a .env file in the root of the project and add the following variables:
```
IP=<Your IPv4>
PORT=<Desired Port>
```

### Step 4: Start the Server
To start the server in development mode, run:
```
npm run dev
```
This will start the server using nodemon, which automatically restarts the server on code changes.

### Step 5: Access the Application
Open your browser and go to "http://_Your IPv4_:_Desired Port_" to access the timer management app.