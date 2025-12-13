# 📱 Phone Mockup Generator

A modern, interactive tool for creating professional phone mockups with custom screenshots. Built with React, TypeScript, and Three.js.

![Phone Mockup Tool](./public/vite.svg)

## ✨ Features

- 🎨 **3D Phone Model** - Interactive 3D iPhone model with realistic rendering
- 📸 **Screenshot Upload** - Easily upload and apply screenshots to the phone screen
- 🖱️ **Interactive Controls** - Rotate and zoom the phone with mouse/touch controls
- 💾 **Export Mockups** - Download high-quality PNG images of your mockups
- 🎯 **Rotation Limits** - Smart camera controls prevent seeing the back of the phone
- 📱 **Responsive Design** - Works great on desktop and mobile devices
- ⚡ **Fast & Modern** - Built with Vite for lightning-fast development

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd phone-mockuo-tool
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎮 Usage

1. **Upload a Screenshot**: Click the "Upload Screenshot" button and select an image from your device
2. **Position the Phone**: Click and drag to rotate the phone to your desired angle
3. **Zoom In/Out**: Use your mouse wheel or pinch gesture to zoom
4. **Export**: Click "Export Mockup" to download your creation as a PNG file

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── PhoneViewer.tsx   # 3D scene container
│   ├── ControlPanel.tsx  # Upload/export controls
│   ├── LoadingState.tsx  # Loading indicator
│   └── ErrorMessage.tsx  # Error display
├── hooks/               # Custom React hooks
│   ├── useThreeScene.ts  # Three.js scene management
│   ├── usePhoneModel.ts  # 3D model loading
│   └── useScreenshot.ts  # Screenshot handling
├── utils/               # Utility functions
│   ├── phoneModelUtils.ts # Model manipulation
│   └── exportUtils.ts     # Export functionality
├── config/              # Configuration
│   └── constants.ts      # App constants
├── types/               # TypeScript types
│   └── index.ts         # Type definitions
├── App.tsx              # Main application
├── App.css              # Application styles
└── index.css            # Global styles
```

## 🛠️ Built With

- **[React](https://react.dev/)** - UI framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Three.js](https://threejs.org/)** - 3D rendering
- **[Vite](https://vitejs.dev/)** - Build tool
- **[ESLint](https://eslint.org/)** - Code linting

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (automatically generates sitemap.xml)
- `npm run build:check` - Type check and build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run generate-sitemap` - Generate sitemap.xml manually

## 🔍 SEO Features

### Sitemap Generation

The build process automatically generates a `sitemap.xml` file in the `dist` folder. This includes all routes defined in `src/config/routes.ts`.

**Automatic Vercel Detection:**
When deploying to Vercel, the sitemap automatically uses the deployment URL - no configuration needed! The script detects `VERCEL_URL` during the build.

**For Custom Domains:**
If you have a custom domain on Vercel, set the `SITE_URL` environment variable in your Vercel project settings:
1. Go to Project Settings → Environment Variables
2. Add `SITE_URL` with your custom domain (e.g., `https://yourdomain.com`)

The sitemap will be available at `https://yourdomain.com/sitemap.xml` after deployment.

### SEO-Friendly URLs

Each phone model has its own SEO-optimized URL:
- `/iphone-3d-mockup` - iPhone mockup generator
- `/android-3d-mockup` - Android mockup generator
- `/` - Homepage

Each page has unique meta tags (title, description, keywords) for better SEO.

## 🎨 Customization

### Adding New Phone Models

1. Place your `.glb` model file in the `public/` directory
2. Update the model path in `src/config/constants.ts`:
```typescript
export const MODEL = {
  PATH: '/your-model.glb',
  SCREEN_MESH_NAME: 'Screen', // Update if different
} as const;
```

### Adjusting Lighting

Modify lighting settings in `src/config/constants.ts`:
```typescript
export const LIGHTING = {
  AMBIENT: { COLOR: 0xffffff, INTENSITY: 2 },
  // ... other lighting settings
} as const;
```

### Camera Controls

Adjust rotation limits in `src/config/constants.ts`:
```typescript
export const ORBIT_CONTROLS = {
  MIN_AZIMUTH: -Math.PI / 3,  // Left rotation limit
  MAX_AZIMUTH: Math.PI / 3,   // Right rotation limit
  // ... other settings
} as const;
```

## 🐛 Troubleshooting

### Model Not Loading
- Ensure the `.glb` file is in the `public/` directory
- Check browser console for error messages
- Verify the model path in `constants.ts`

### Screenshot Not Appearing
- Make sure you're uploading a valid image file
- Check that the mesh name matches 'Screen' in your model
- Images must be under 10MB

### Performance Issues
- Try reducing the model complexity
- Lower the renderer antialias setting
- Reduce lighting intensity

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Phone model from [source]
- Inspiration from various mockup tools
- Built with ❤️ using modern web technologies

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Made with ❤️ and ☕
