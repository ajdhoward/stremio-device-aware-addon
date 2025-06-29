const { addonBuilder } = require("stremio-addon-sdk");
const express = require("express");
const NodeCache = require("node-cache");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

const port = process.env.PORT || 7000;

const manifest = {
    "id": "org.scholar.stremio.deviceaware",
    "version": "1.0.0",
    "name": "Device-Aware Stremio Provisioner",
    "description": "Provides device-aware filtering with TorBox real streams",
    "resources": ["catalog", "stream"],
    "types": ["movie", "series"],
    "idPrefixes": ["tt"],
    "catalogs": [
        {
            type: "movie",
            id: "device-aware-catalog",
            name: "Device Aware Movies"
        },
        {
            type: "series",
            id: "device-aware-catalog",
            name: "Device Aware Series"
        }
    ]
};

const builder = new addonBuilder(manifest);
const cache = new NodeCache({ stdTTL: 300 });

const deviceCapabilities = {
    "Firestick_4K": { "max_resolution": "4K", "preferred_codec": "HEVC" },
    "Android_Phone": { "max_resolution": "1080p", "preferred_codec": "H.264" },
    "Windows_PC": { "max_resolution": "4K", "preferred_codec": "HEVC" }
};

// Fetch real streams from TorBox using their public API
async function fetchTorBoxStreams(id) {
    try {
        const response = await fetch(`https://torbox.app/api/v1/stream/movie/${id}.json`);
        if (!response.ok) {
            console.error(`TorBox fetch failed: ${response.statusText}`);
            return [];
        }
        const data = await response.json();
        return data.streams.map(s => ({
            title: s.title || 'Unnamed Stream',
            url: s.url,
            resolution: s.title.includes('4K') ? '4K' : (s.title.includes('1080p') ? '1080p' : '720p'),
            codec: s.title.toLowerCase().includes('hevc') ? 'HEVC' : 'H.264'
        }));
    } catch (err) {
        console.error(`Error fetching TorBox streams: ${err}`);
        return [];
    }
}

// Device-aware filter
function filterStreams(streams, deviceProfile) {
    return streams.filter(s => {
        const resolutionCheck = (deviceProfile.max_resolution === "4K" || s.resolution !== "4K");
        const codecCheck = s.codec === deviceProfile.preferred_codec;
        return resolutionCheck && codecCheck;
    });
}

// Catalog handler (placeholder, returns empty)
builder.defineCatalogHandler(({ type, id, extra }) => {
    return Promise.resolve({ metas: [] });
});

// Stream handler with TorBox and device-aware filtering
builder.defineStreamHandler(async ({ id, userAgent }) => {
    const cacheKey = `${id}-${userAgent}`;
    if (cache.has(cacheKey)) {
        return { streams: cache.get(cacheKey) };
    }

    const deviceType = userAgent.includes("Mobile") ? "Android_Phone" : "Windows_PC";
    const deviceProfile = deviceCapabilities[deviceType] || deviceCapabilities["Windows_PC"];

    const streams = await fetchTorBoxStreams(id);
    const filteredStreams = filterStreams(streams, deviceProfile);
    cache.set(cacheKey, filteredStreams);

    return { streams: filteredStreams };
});

// Serve manifest
app.get("/manifest.json", (_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(builder.getInterface().manifest));
});

// Serve add-on resources
app.get("/:resource/:type/:id/:extra?.json", (req, res) => {
    builder.getInterface().get(req, res);
});

app.listen(port, () => console.log(`🚀 Stremio Device-Aware TorBox Add-on live on port ${port}`));
