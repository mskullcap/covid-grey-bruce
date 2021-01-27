/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: '/',
    src: '/dist',
  },
  plugins: [
    '@snowpack/plugin-svelte'
  ],
  packageOptions: {
    // source: "skypack"
    source: "local",
    optimize: {
      bundle: true,
      minify: true,
      target: 'es2018'
    }
  }
};
