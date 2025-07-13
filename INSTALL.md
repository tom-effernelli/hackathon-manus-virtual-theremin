\## 1. Install Prerequisites



Before you can run the project, you need to ensure you have Node.js and pnpm installed on your system.



\### Node.js



Node.js is a JavaScript runtime environment. You can download the latest LTS (Long Term Support) version from the official Node.js website: \[https://nodejs.org/](https://nodejs.org/)



Follow the installation instructions for your operating system. It is recommended to use a Node.js version manager like `nvm` (Node Version Manager) for easier management of Node.js versions.



\### pnpm



pnpm is a fast, disk-space efficient package manager for Node.js. If you don't have pnpm installed, you can install it globally using npm (which comes with Node.js):



```bash

npm install -g pnpm

```



\## 2. Install Project Dependencies



Once Node.js and pnpm are installed, navigate into the extracted project directory (`hackathon-manus-virtual-theremine`) in your terminal and install the project dependencies.



```bash

cd hackathon-manus-virtual-theremine

pnpm install

```



This command will download and install all the necessary libraries and packages required for the project to run. This might take a few minutes depending on your internet connection.



\## 3. Run the Development Server



After all dependencies are installed, you can start the development server. This will compile the project and make it accessible in your web browser.



```bash

pnpm run dev

```



This command will typically output a local URL (e.g., `http://localhost:5173/`) where the application is running.



\## 4. Access the Application



Open your web browser and navigate to the URL provided by the `pnpm run dev` command (e.g., `http://localhost:5173/`).



The application will load, and you will be prompted to allow camera access. Grant permission to start interacting with the Virtual Theremin.



Enjoy your interactive musical experience!

