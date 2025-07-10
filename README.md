# Virtual Theremin - Hand Gesture Recognition

An interactive web application that transforms hand gestures into musical notes, mimicking the classic theremin instrument. Control pitch and volume with your hand movements in real-time.

## Features

- **Real-time Hand Tracking:** Utilizes MediaPipe Hand Landmarker for precise hand detection.
- **Pitch Control:** Horizontal hand position (X-axis) controls the frequency of the sound (left for low, right for high).
- **Volume Control:** Hand distance from the camera (Z-axis) controls the volume (closer for louder, farther for softer).
- **Unified Sound:** Both hands produce the same pure sine wave sound, allowing for harmonic play.
- **Optimized Audio:** Wide frequency range (200 Hz to 2000 Hz) and corrected volume logic for a natural and audible experience.
- **Clean User Interface:** Professional and minimalist design with real-time visual feedback, no emojis.
- **Responsive Camera Display:** Corrected aspect ratio for a natural, un-stretched camera feed.

## How to Use

1.  **Access the application** via the live demo URL.
2.  **Click "Start Theremin"** to enable your camera and audio.
3.  **Allow camera access** when prompted by your browser.
4.  **Place your hands** in front of the camera.
5.  **Move your hands horizontally** to change the pitch.
6.  **Move your hands closer or farther** from the camera to adjust the volume.

## Technologies Used

-   **Frontend:** React 19 with Vite
-   **Hand Tracking:** MediaPipe Hand Landmarker
-   **Audio:** Web Audio API
-   **Styling:** Tailwind CSS

## Installation for Local Development

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd virtual-drum-app # or your renamed directory
    ```
2.  **Install dependencies:** Ensure you have Node.js and pnpm installed.
    ```bash
    pnpm install
    ```
3.  **Start the development server:**
    ```bash
    pnpm run dev
    ```
    The application will be available at `http://localhost:5173/` (or a similar address).

## Compatibility

Works best on modern web browsers (Chrome, Firefox, Safari, Edge) with camera and Web Audio API support. GPU acceleration is recommended for optimal performance.

---

**Experience the future of musical interaction with the Virtual Theremin!**


