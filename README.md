# SVG Icon Composer

A modern web application designed to turn raster images (PNG, JPG) into perfectly clean, scalable SVG vectors. Built specifically for generating vector assets for icon composer tools and app development.

## Features

- **Drag and Drop Interface**: Instantly load images for processing.
- **Client-Side Processing**: Fully private and extremely fast. Your images never leave the browser.
- **Extract White Only**: A specialized feature to isolate white shapes and flatten topographic 3D effects into clean 2D vectors.
- **Despeckle & White Thresholding**: Fine-tune filters to delete noisy shadows, desk textures, and artifacts.
- **Curve Smoothing**: Native support for Q-Splines and dynamic edge expansion (Stroke Width) for organic, flawless curves.
- **Premium Design**: Dark mode UI with glassmorphism and real-time side-by-side previews.

## How to Run

Since this is a vanilla HTML/JS/CSS application, no build tools, `npm`, or servers are required!

1. Clone or download this repository.
2. Open `index.html` in your web browser (Chrome, Safari, Firefox, Arc, etc.).
3. Drag an image in, tune the settings, and download your perfectly clean SVG!

## Recommended Settings for Clean Logos

To trace a dark image with bright white 3D layers and get a perfectly flat, clean white silhouette:
1. Set **Colors** down to `2` or `3`.
2. Turn **Extract White Only** to `ON`.
3. Increase **White Threshold** (e.g., `210`) if background textures are showing up.
4. Increase **Despeckle** (e.g., `40`) if tiny floating artifact dots remain.
5. Turn **Right Angle Enhance** to `OFF` if your logo is circular/organic.
6. Turn **Q-Splines** to `ON` for perfectly smooth curves.
7. Increase **Stroke Width** (e.g., `1.5`) to expand the white areas and perfectly fill any jagged gaps left behind by deleted shadows.

## Acknowledgements
Vector tracing powered by the excellent [imagetracerjs](https://github.com/jankovicsandras/imagetracerjs).
