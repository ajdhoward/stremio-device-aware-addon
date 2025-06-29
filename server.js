// Stremio Device-Aware Add-on - Deployment Ready
const { addonBuilder } = require("stremio-addon-sdk");
const express = require("express");
const NodeCache = require("node-cache");

const app = express();
const port = process.env.PORT || 10000;

const manifest = {
    "id": "org.scholar.stremio.deviceaware",
    "version": "1.0.0",
    "name": "Device-Aware Stremio Provisioner",
    "description": "Provides device-aware filtering and smart provisioning for Stremio streams",
    "resources": ["catalog", "stream"],
    "types": ["movie", "series"],
    "idPrefixes": ["tt"]
};

const builder = new addonBuilder(manifest);
const cache = new NodeCache({ stdTTL: 300 });

const deviceCapabilities = {
    "Firestick_4K": { "max_resolution": "4K", "preferred_codec": "HEVC" },
    "Android_Phone": { "max_resolution": "1080p", "preferred_codec": "H.264" },
    "Windows_PC": { "max_resolution": "4K", "preferred_codec": "HEVC" }
};

// Simulated Torrentio integration
async function fetchStreamsSimulated(id) {
    return [
        { title: "4K_HEVC_Stream", url: "magnet:?xt=urn:btih:example4k", resolution: "4K", codec: "HEVC" },
        { title: "1080p_H264_Stream", url: "magnet:?xt=urn:btih:example1080p", resolution: "1080p", codec: "H.264" }
    ];
}

// Filter by device
function filterStreams(streams, deviceProfile) {
    return streams.filter(s => {
        const resolutionCheck = (deviceProfile.max_resolution === "4K" || s.resolution !== "4K");
        const codecCheck = s.codec === deviceProfile.preferred_codec;
        return resolutionCheck && codecCheck;
    });
}

// Stream Handler
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

// Manifest and Routing
app.get("/manifest.json", (_, res) => res.json(builder.getInterface().manifest));
app.get("/:resource/:type/:id/:extra?.json", (req, res) => {
    builder.getInterface().get(req, res);
});

app.listen(port, () => console.log(`🚀 Stremio Device-Aware Add-on live on port ${port}`));
