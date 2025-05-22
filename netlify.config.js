
module.exports = {
  // Explicitly setting the framework to an empty string prevents auto-detection
  framework: {
    name: "",
    viteConfigPath: "vite.config.ts"
  },
  
  // Ensure that we're using the correct build command
  build: {
    command: "npm run build",
    directory: "dist"
  }
};
