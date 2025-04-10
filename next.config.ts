/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config: any) => {
		// Add loader for GeoJSON files
		config.module.rules.push({
			test: /\.geojson$/,
			type: 'json',
		});

		return config;
	},
};

export default nextConfig;
