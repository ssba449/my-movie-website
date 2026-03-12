module.exports = {
    apps: [
        {
            name: 'movieweb-frontend',
            script: 'node_modules/next/dist/bin/next',
            args: 'start -p 3000',
            cwd: './frontend',
            env: {
                NODE_ENV: 'production',
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
        },
        {
            name: 'showbox-api',
            script: 'server.js',
            cwd: './backend/showbox-febbox-api-master/showbox-febbox-api-master/api/src',
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
        },
        {
            name: 'stream-server',
            script: 'server.js',
            cwd: './backend/stream-server',
            env: {
                NODE_ENV: 'production',
                PORT: 4000,
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
        }
    ]
};
