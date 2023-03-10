/// <reference path="./navigation_api.d.ts" />
import { Config, loadConfig, saveConfig } from '@/config';

const HOME_URL = "/";
const SUB_BOX_URL = "/feed/subscriptions";

const MAX_ATTEMPTS = 20;
const TIMEOUT = 150; // MS
const UPDATE_INTERVAL = 1000; // MS

let batch = 0;
let lastUpdate = new Date();

/* UTIL FUNCTIONS */
const incrementBlocked = (count: number): void => {
    batch += count;

    const elapsed = new Date().getTime() - lastUpdate.getTime();

    if (elapsed > UPDATE_INTERVAL) {
        const thisBatch = batch;
        loadConfig().then(config => {
            saveConfig({ ...config, blocked: config.blocked + thisBatch });
        });
        batch = 0;
    }
};

/* SHORTS REMOVAL FUNCTIONS */

const removeShortsHome = (): boolean => {
    const richSections =
        document.getElementsByTagName("ytd-rich-section-renderer") as any as Element[];

    for (const richSection of richSections) {
        const title = richSection.querySelector("#title");
        if (!title) continue;

        if (title.innerHTML === "Shorts") {
            richSection.remove();
            incrementBlocked(1);
            return true;
        }
    }

    return false;
}

const removeShortsSidebar = (): void => {
    const guideEntries =
        document.getElementsByTagName("ytd-guide-entry-renderer") as any as Element[];
    let count = 0;

    for (const guideEntry of guideEntries) {
        const title = guideEntry.querySelector('a[title="Shorts"]');
        if (!title) continue;

        guideEntry.remove();
        count++;
    }

    const miniGuideEntries
        = document.getElementsByTagName("ytd-mini-guide-entry-renderer") as any as Element[];

    for (const miniGuideEntry of miniGuideEntries) {
        const title = miniGuideEntry.querySelector('a[title="Shorts"]');
        if (!title) continue;

        miniGuideEntry.remove();
        count++;
    }

    incrementBlocked(count);
};

const removeShortsSubBox = (): void => {
    const videoRenderers =
        document.getElementsByTagName("ytd-grid-video-renderer") as any as Element[];
    let count = 0;

    for (const videoRenderer of videoRenderers) {
        const overlay = videoRenderer.querySelector('ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]');
        if (!overlay) continue;

        videoRenderer.remove();
        count++;
    }

    incrementBlocked(count);
};

/* MUTATION OBSERVERS */

const homeObserver = new window.MutationObserver((mutations, observer) => {
    let found = false;
    for (const mutation of mutations) {
        const target = mutation.target as Element;
        if (mutation.type === 'childList' && target.querySelector('ytd-rich-section-renderer')) {
            found = true;
        }
    }

    if (found) {
        removeShortsHome();
    }
});

const sidebarObserver = new window.MutationObserver(() => {
    removeShortsSidebar();
});

const subboxObserver = new window.MutationObserver((mutations) => {
    let found = false;
    for (const mutation of mutations) {
        const target = mutation.target as Element;
        if (target.tagName === "YTD-GRID-VIDEO-RENDERER") {
            found = true;
        }
        if (target.tagName === "YTD-MENU-RENDERER") {
            found = true;
        }
    }

    if (found) {
        removeShortsSubBox();
    }
});

/* OBSERVER SUBSCRIBERS */

const startHomeObserver = (): void => {
    homeObserver.disconnect();
    removeShortsHome();

    const home = document.querySelector("#contents.ytd-rich-grid-renderer");
    if (!home) {
        console.error('homeless');
        return;
    }

    homeObserver.observe(home, {
        childList: true,
    });
}

const startSidebarObserver = (attempts: number = 0): void => {
    sidebarObserver.disconnect();

    const guide = document.querySelector("ytd-guide-renderer");
    const miniGuide = document.querySelector("ytd-mini-guide-renderer");
    if (!guide || !miniGuide) {
        if (attempts < MAX_ATTEMPTS) {
            setTimeout(() => startSidebarObserver(attempts + 1), TIMEOUT);
        } else {
            console.error('guideless');
        }
        return;
    }

    removeShortsSidebar();

    sidebarObserver.observe(guide, {
        subtree: true,
        childList: true,
    });

    sidebarObserver.observe(miniGuide, {
        subtree: true,
        childList: true,
    });
}

const startSubBoxObserver = (attempts: number = 0): void => {
    subboxObserver.disconnect();

    const grid = document.querySelector("#contents.ytd-section-list-renderer");
    if (!grid) {
        if (attempts < MAX_ATTEMPTS) {
            setTimeout(() => startSubBoxObserver(attempts + 1), TIMEOUT);
        } else {
            console.error('gridless');
        }
        return;
    }

    removeShortsSubBox();

    subboxObserver.observe(grid, {
        subtree: true,
        childList: true,
    });
}

/* MAIN FUNCTIONS */

const applyExtension = (config: Config): void => {
    if (config.remove_home && window.location.pathname == HOME_URL) {
        startHomeObserver();
    }

    if (config.remove_sidebar) {
        startSidebarObserver();
    }

    if (config.remove_sub_box && window.location.pathname == SUB_BOX_URL) {
        startSubBoxObserver();
    }
}

const pageLoaded = async (): Promise<void> => {
    const config = await loadConfig();

    if (!config.enabled) {
        return;
    }

    applyExtension(config);

    window.navigation.addEventListener("navigate", async () => {
        const config = await loadConfig();
        if (config.enabled) {
            applyExtension(await loadConfig());
        }
    });
};

pageLoaded();

export default {};