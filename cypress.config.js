module.exports = {
    allowCypressEnv: false,

    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        testIsolation: false   // ← agregá esta línea
    },
};