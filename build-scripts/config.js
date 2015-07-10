module.exports = {
  build: {
    image: {
      jpegopts: {
        loops: 10,
        method: "ssim",
        accuracy: true,
        quality: "low"
      },
      pngopts: [],
      gifopts: []
    }
  }
};
