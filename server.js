const { addonBuilder } = require("stremio-addon-sdk");
const express = require("express");
const NodeCache = require("node-cache");
const cors = require("cors"); // ✅ Added for Stremio compatibility

const app = express();
app.use(cors()); // ✅ Enable CORS for all routes

const port = process.env.PORT || 7000;

const manifest = {
    "id": "org.scholar.stremio.deviceaware",
    "version": "1.0.0",
    "name": "Device-Aware Stremio Provisioner",
    "description": "Provides device-aware filtering and smart provisioning for Stremio streams",
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

// Simulated streams for demonstration
async function fetchStreamsSimulated(id) {
    return [
        { title: "4K_HEVC_Stream", url: "magnet:?xt=urn:btih:example4k", resolution: "4K", codec: "HEVC" },
        { title: "1080p_H264_Stream", url: "magnet:?xt=urn:btih:example1080p", resolution: "1080p", codec: "H.264" }
    ];
}

// Filters streams based on device profile
function filterStreams(streams, deviceProfile) {
    return streams.filter(s => {
        const resolutionCheck = (deviceProfile.max_resolution === "4K" || s.resolution !== "4K");
        const codecCheck = s.codec === deviceProfile.preferred_codec;
        return resolutionCheck && codecCheck;
    });
}

// Catalog handler (returns empty, placeholder for future real meta)
builder.defineCatalogHandler(({ type, id, extra }) => {
    return Promise.resolve({ metas: [] });
});

// Stream handler with device-aware filtering
builder.defineStreamHandler(async ({ id, userAgent }) => {
    const cacheKey = `${id}-${userAgent}`;
    if (cache.has(cacheKey)) {
        return { streams: cache.get(cacheKey) };
    }

    const deviceType = userAgent.includes("Mobile") ? "Android_Phone" : "Windows_PC";
    const deviceProfile = deviceCapabilities[deviceType] || deviceCapabilities["Windows_PC"];

    const streams = await fetchStreamsSimulated(id);
    const filteredStreams = filterStreams(streams, deviceProfile);
    cache.set(cacheKey, filteredStreams);

    return { streams: filteredStreams };
});

// Serve manifest.json
app.get("/manifest.json", (_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(builder.getInterface().manifest));
});

// Serve addon routes
app.get("/:resource/:type/:id/:extra?.json", (req, res) => {
    builder.getInterface().get(req, res);
});

// Start server
app.listen(port, () => console.log(`🚀 Stremio Device-Aware Add-on is live on port ${port}`));
