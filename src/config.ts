import browser from 'webextension-polyfill';

export interface Config {
    loaded: boolean,
    dark_theme: boolean,
    enabled: boolean,
    remove_home: boolean,
    remove_sidebar: boolean,
    remove_sub_box: boolean,
    blocked: number,
};

export const DEFAULT_CONFIG: Config = {
    loaded: false,
    dark_theme: false,
    enabled: true,
    remove_home: true,
    remove_sidebar: true,
    remove_sub_box: true,
    blocked: 0,
};

export const loadConfig = async (): Promise<Config> => {
    const config = await browser.storage.sync.get(DEFAULT_CONFIG) as Config;
    config.loaded = true;
    return config;
}

export const saveConfig = async (config: Config): Promise<boolean> => {
    if (!config.loaded) {
        return false;
    }

    try {
        await browser.storage.sync.set(config);
        return true;
    } catch (error) {
        console.error('Failed to save configuration');
        console.error(error);
        return false;
    }
}