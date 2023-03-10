import React, { createContext, useEffect, useState } from 'react';
import { Config, DEFAULT_CONFIG, loadConfig, saveConfig } from './config';
import browser from 'webextension-polyfill';

const colourSchemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

type UpdateConfig = React.Dispatch<React.SetStateAction<Config>>;

export const ConfigContext = createContext<Config & { updateConfig: UpdateConfig }>
    ({ ...DEFAULT_CONFIG, updateConfig: () => undefined });

interface ConfigProviderProps {
    children?: React.ReactNode,
}

export const ConfigProvider: React.FC<ConfigProviderProps> = (props) => {
    const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

    const updateBrowserTheme = (event: MediaQueryListEvent) => {
        setConfig(config => {
            config = { ...config };
            config.dark_theme = event.matches;
            return config;
        });
    };

    useEffect(() => {
        (async () => {
            const config = await loadConfig();
            config.dark_theme = colourSchemeMediaQuery.matches;
            setConfig(config);
        })();

        colourSchemeMediaQuery.addEventListener('change', updateBrowserTheme);

        return () => {
            colourSchemeMediaQuery.removeEventListener('change', updateBrowserTheme);
        };
    }, []);

    useEffect(() => {
        saveConfig(config);
    }, [config]);

    browser.storage.sync.onChanged.addListener(() => {
        (async () => {
            const config = await loadConfig();
            setConfig(config);
        })();
    });

    return (
        <ConfigContext.Provider value={{ ...config, updateConfig: setConfig }}>
            {props.children}
        </ConfigContext.Provider>
    );
};