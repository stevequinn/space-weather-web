# Space Weather Website

This is a frontend for the Space Weather API. It's a nice little app to show if there will be a geomagnetic storm today or in the near future, and perhaps an Aurora I can go and take silly photos of. 

## TODO

[x] API modules and calls
- Zustand state management as I want to learn Zustand, no real use reason.  
[x] index page showing current conditions. 
  - Some sort of Three.js or other visualisation of the magnetosphere would be cool here
  - This is kind of rough and straight from our AI overlords. Needs tweaking.
- styling - can probably get away without ShadCN but I'll play it as it comes. 
- Weather event history. I'll need to hook up a database to the API for this. 

## Dev Notes

### Building and Running Locally

In order to run the built app locally (in prod mode) you should use the `npm run serve` command as this injects the non-VITE_ prefixed env vars needed for the app to run. In real production mode the standard `npm start` command will work as env vars are injected by the hosting platform.

## React orig tech stack details

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
