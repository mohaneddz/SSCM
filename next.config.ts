/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config) => {
	  config.module.rules.push({
		test: /\.geojson$/,
		type: 'json',
	  });
	  return config;
	},
	images: {
		domains: ['nvuvnxcofuguboorzqwa.supabase.co'], // replace with your actual Supabase project domain if different
	  },
  };
  
  module.exports = nextConfig;