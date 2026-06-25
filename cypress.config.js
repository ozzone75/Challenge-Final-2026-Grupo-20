module.exports = {
  allowCypressEnv: false,

  e2e: {
    baseUrl: 'https://automationintesting.online',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
};