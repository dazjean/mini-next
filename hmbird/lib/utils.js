import fs from 'fs';
import path from 'path';
const configPath = path.resolve(process.cwd(), './config/hmbird.config.js');
const defaultConfig = {
    ssrCache: true,
    ssrIngore: new RegExp()
};
export function isResSent(res) {
    return res.finished || res.headersSent;
}

function normalizeConfig(App, config) {
    if (typeof config === 'function') {
        config = config(App, { defaultConfig });

        if (typeof config.then === 'function') {
            throw new Error('> Promise returned in hmbird config');
        }
    }
    return config;
}

export function getConfig(App) {
    if (fs.existsSync(configPath)) {
        let configModule = require(configPath);
        let useConfig = normalizeConfig(App, configModule);
        return useConfig;
    } else {
        return defaultConfig;
    }
}
