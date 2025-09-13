/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true,
    },
    images: {
        domains: [],
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.(png|jpe?g|gif|svg)$/i,
            use: {
                loader: 'file-loader',
                options: {
                    publicPath: '/_next/static/images/',
                    outputPath: 'static/images/',
                },
            },
        });
        return config;
    },
}

module.exports = nextConfig