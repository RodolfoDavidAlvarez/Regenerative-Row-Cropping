const express = require('express');
const path = require('path');
const cors = require('cors');
const net = require('net');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8081;
const isDev = process.env.NODE_ENV !== 'production';
const liveReloadPort = Number(process.env.LIVERELOAD_PORT) || 35731;

// Helper function to check if a port is available
function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
            server.once('close', () => resolve(true));
            server.close();
        });
        server.on('error', () => resolve(false));
    });
}

// Helper function to find an available port starting from a given port
async function findAvailablePort(startPort, maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
        const port = startPort + i;
        const available = await isPortAvailable(port);
        if (available) {
            return port;
        }
    }
    return null;
}

// Enable CORS for all routes
app.use(cors());

// Inject live-reload script and watcher in development
if (isDev) {
    (async () => {
        const livereload = require('livereload');
        const connectLivereload = require('connect-livereload');

        // Check if port is available before creating server
        const portAvailable = await isPortAvailable(liveReloadPort);

        if (!portAvailable) {
            console.warn(`🔥 LiveReload port ${liveReloadPort} already in use. Skipping livereload.`);
            console.warn(`   You can kill the existing process or set LIVERELOAD_PORT to use a different port.`);
            return;
        }

        try {
            const liveReloadServer = livereload.createServer({
                exts: ['html', 'css', 'js', 'png', 'jpg', 'jpeg', 'svg'],
                port: liveReloadPort,
                delay: 100,
                debug: false
            });

            // Attach error handler to catch any unexpected errors
            liveReloadServer.server.on('error', (err) => {
                if (err && err.code === 'EADDRINUSE') {
                    console.warn(`🔥 LiveReload port ${liveReloadPort} became unavailable. Disabling livereload.`);
                } else {
                    console.error('LiveReload error:', err);
                }
            });

            liveReloadServer.server.on('listening', () => {
                // Watch the current directory for any changes
                liveReloadServer.watch([
                    __dirname,
                    path.join(__dirname, 'assets')
                ]);
                console.log(`🔄 LiveReload enabled on port ${liveReloadPort}`);
                console.log(`   Watching: Current directory and assets/`);
                console.log(`   Open http://localhost:${PORT} in your browser to see changes automatically`);
            });

            // Log when files change
            liveReloadServer.server.on('reload', (files) => {
                console.log(`🔄 Reloading browser for: ${files.join(', ')}`);
            });

            // Inject live reload script into HTML responses
            app.use(connectLivereload({
                port: liveReloadPort,
                ignore: ['.js', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico']
            }));
        } catch (err) {
            console.error('Failed to start LiveReload:', err);
        }
    })();
}

// Serve static files from current directory
app.use(express.static(__dirname));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'regenerative-field-trial-proposal.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error logging endpoint
app.post('/api/log-error', express.json(), (req, res) => {
    console.error('Client Error:', req.body);
    res.json({ status: 'logged' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server with port availability check
(async () => {
    let actualPort = PORT;

    // Check if the requested port is available
    const portAvailable = await isPortAvailable(PORT);

    if (!portAvailable) {
        // In development, try to find an available port automatically
        if (isDev) {
            console.warn(`⚠️  Port ${PORT} is already in use. Looking for an available port...`);
            const availablePort = await findAvailablePort(PORT);
            if (availablePort) {
                actualPort = availablePort;
                console.log(`✅ Found available port: ${actualPort}`);
            } else {
                console.error(`❌ Could not find an available port starting from ${PORT}`);
                console.error(`   Please kill the process using port ${PORT} or set PORT environment variable.`);
                process.exit(1);
            }
        } else {
            // In production, fail fast
            console.error(`❌ Port ${PORT} is already in use.`);
            console.error(`   Please either:`);
            console.error(`   1. Kill the process using port ${PORT}`);
            console.error(`   2. Set PORT environment variable to use a different port`);
            process.exit(1);
        }
    }

    const server = app.listen(actualPort, () => {
        console.log('');
        console.log('🌱 ═══════════════════════════════════════════════════════════════');
        console.log('   REGENERATIVE FIELD TRIAL PROPOSAL - Live Preview Server');
        console.log('═══════════════════════════════════════════════════════════════════');
        console.log(`🚀 Server running on http://localhost:${actualPort}`);
        console.log(`📄 Preview: http://localhost:${actualPort}`);
        console.log(`💚 Health check: http://localhost:${actualPort}/health`);
        console.log('');
        console.log('📝 Edit regenerative-field-trial-proposal.html to see live updates');
        console.log('🖼️  Add images to assets/ folder - they will appear automatically');
        console.log('═══════════════════════════════════════════════════════════════════');
        console.log('');
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${actualPort} became unavailable.`);
            process.exit(1);
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });
})();
