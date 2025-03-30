import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
 

    return {
        plugins: [], 
        base: mode=="development"? "./" : "/three.js-visual-node-editor/",
        server: {
          host: '0.0.0.0',
          port: 5173, // Replace with your desired port if needed
        }  
      }
})
