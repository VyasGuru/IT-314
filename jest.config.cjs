// jest.config.cjs
module.exports = {
    testEnvironment: "node",
  
    // Transform .js files with babel-jest (so features like top-level await work)
    transform: {
      "^.+\\.js$": "babel-jest"
    },
  
    // Make babel-jest emit ESM-compatible output for an ESM project
    globals: {
      "babel-jest": {
        useESM: true
      }
    },
  
    verbose: true
  };
  