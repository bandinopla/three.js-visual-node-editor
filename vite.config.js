import { defineConfig } from 'vite'
import packageJson from './package.json'; // Import package.json

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
 

    return {
        plugins: [], 
        base: mode=="development"? "./" : "/three.js-visual-node-editor/",
        server: {
          host: '0.0.0.0',
          port: 5173, // Replace with your desired port if needed
        } ,
        define: {
            'import.meta.env.APP_VERSION': JSON.stringify(packageJson.version), // Define the version
          }, 
      }
})
