# 📱 How to Add Samsung Galaxy S24 Model

Your app is now ready to support multiple phone models! Here's how to add a Samsung device:

## 📥 Step 1: Get a Samsung GLB Model

### Option A: Download from Free Sources
1. **Sketchfab** (free 3D models)
   - Visit: https://sketchfab.com
   - Search for "Samsung Galaxy S24" or "Samsung S24"
   - Filter by "Downloadable" and look for GLB format
   - Download and save as `samsung-s24.glb`

2. **CGTrader** (some free models)
   - Visit: https://www.cgtrader.com
   - Search for "Samsung Galaxy S24 3D model GLB"
   - Look for free downloads

3. **TurboSquid** (some free models)
   - Visit: https://www.turbosquid.com
   - Search for "Samsung Galaxy S24 GLB"

### Option B: Create Your Own
- Use Blender (free) to create or convert a model to GLB
- Make sure the screen mesh is named "Screen"

## 📂 Step 2: Add the File

1. Place your downloaded `samsung-s24.glb` file in the `public/` folder:
   ```
   public/
   ├── iphone2.glb          ✅ (already exists)
   ├── samsung-s24.glb      ⭐ (add this)
   └── vite.svg
   ```

## ⚙️ Step 3: Configure the Model (if needed)

If your Samsung model uses a different screen mesh name, update it in:

**`src/config/phoneModels.ts`**

```typescript
{
  id: 'samsung-s24',
  name: 'Samsung Galaxy S24',
  displayName: 'Samsung Galaxy S24',
  modelPath: '/samsung-s24.glb',
  screenMeshName: 'Screen', // ⬅️ Change this if different
  screenResolution: {
    width: 360,  // ⬅️ Update to actual screen resolution
    height: 780,
  },
  manufacturer: 'samsung',
}
```

### How to Find the Screen Mesh Name:
1. Open the GLB file in Blender
2. Look at the object hierarchy
3. Find the mesh that represents the screen
4. Use that exact name in `screenMeshName`

## 🎨 Step 4: Test It

1. Run the project:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173

3. Use the **"Device Model"** dropdown in the sidebar to switch between:
   - iPhone 15 Pro
   - Samsung Galaxy S24

## 📏 Optimal Resolutions

The app will automatically show the recommended resolution for each device:
- **iPhone 15 Pro**: 393×852
- **Samsung Galaxy S24**: 360×780 (adjust if your model is different)

## 🔧 Troubleshooting

### Model doesn't load?
- ✅ Check file name is exactly `samsung-s24.glb`
- ✅ Make sure it's in the `public/` folder
- ✅ Check browser console for errors
- ✅ Verify GLB file isn't corrupted

### Screenshot doesn't appear on screen?
- ✅ Check `screenMeshName` matches the actual mesh name in your GLB
- ✅ Open the GLB in Blender to verify mesh names
- ✅ Update the `screenMeshName` in `phoneModels.ts`

### Screen looks weird?
- ✅ Verify the screen mesh is a flat plane
- ✅ Check UV mapping is correct
- ✅ Ensure the mesh has proper normals facing outward

## 🚀 Adding More Models

Want to add more models? Easy! Just:

1. Add the GLB file to `public/`
2. Add a new entry to the `PHONE_MODELS` array in `src/config/phoneModels.ts`:

```typescript
{
  id: 'pixel-8',
  name: 'Google Pixel 8',
  displayName: 'Google Pixel 8',
  modelPath: '/pixel-8.glb',
  screenMeshName: 'Screen',
  screenResolution: { width: 412, height: 915 },
  manufacturer: 'google', // Add more manufacturers as needed
}
```

## 📚 Recommended Samsung Models

For best results, look for models that:
- ✅ Are in GLB format
- ✅ Have a clearly defined screen mesh
- ✅ Are properly UV mapped
- ✅ Aren't too high-poly (keep under 100k polygons)
- ✅ Have realistic proportions

Good model names to search for:
- Samsung Galaxy S24
- Samsung Galaxy S23
- Samsung Galaxy S24 Ultra
- Samsung S24 Plus

---

**Need help?** Check the browser console for error messages or inspect the GLB file in Blender!

