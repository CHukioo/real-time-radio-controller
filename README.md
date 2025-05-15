# Radio Controller

A real-time radio controller application built with React and PocketBase. Control and stream radio stations with a modern, user-friendly interface.

## Features

- Real-time station switching
- Volume control synchronization
- Modern, Chakra UI-inspired design
- Responsive layout
- Custom audio controls
- Play/pause functionality
- Mute/unmute controls

## Tech Stack

- React.js
- PocketBase
- Bootstrap
- FontAwesome icons
- Vercel (Deployment)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PocketBase server

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/radio-controller.git
cd radio-controller
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory:
```
REACT_APP_POCKETBASE_URL=your_pocketbase_url
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

## Deployment on Vercel

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [Vercel](https://vercel.com) and sign in with your GitHub account

3. Click "New Project" and import your repository

4. Configure your project:
   - Framework Preset: Create React App
   - Build Command: `npm run build` or `yarn build`
   - Output Directory: `build`
   - Install Command: `npm install` or `yarn install`

5. Add environment variables:
   - `REACT_APP_POCKETBASE_URL`: Your PocketBase server URL

6. Click "Deploy"

Vercel will automatically deploy your application and provide you with a URL. It will also set up automatic deployments for future pushes to your repository.

## Project Structure

```
radio-controller/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Player.js
│   │   └── Controller.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Usage

1. Open the controller page (`/`) to manage radio stations
2. Open the player page (`/player`) to listen to the current station
3. Use the controller to:
   - Switch between stations
   - Control volume
   - Play/pause
   - Mute/unmute

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [PocketBase](https://pocketbase.io/)
- [Bootstrap](https://getbootstrap.com/)
- [FontAwesome](https://fontawesome.com/)
- [Vercel](https://vercel.com)
