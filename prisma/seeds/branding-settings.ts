import { PrismaClient } from '@prisma/client';

export async function seedBrandingSettings(prisma: PrismaClient) {
	console.log('Seeding branding settings...');

	await prisma.brandingSettings.upsert({
		where: { id: 1 },
		update: {},
		create: {
			logo: 'https://example.com/logo.png',
			primaryColor: '#1a73e8',
			secondaryColor: '#4285f4',
			accentColor: '#fbbc04',
			fontFamily: 'Inter',
			customCss: `
				:root {
					--primary-color: #1a73e8;
					--secondary-color: #4285f4;
					--accent-color: #fbbc04;
				}
			`
		}
	});

	await prisma.brandKit.upsert({
		where: { id: 'default-brand-kit' },
		update: {},
		create: {
			logo: {
				main: 'https://example.com/logo.png',
				alternate: 'https://example.com/logo-alt.png',
				favicon: 'https://example.com/favicon.ico'
			},
			colors: {
				primary: '#1a73e8',
				secondary: '#4285f4',
				accent: '#fbbc04',
				success: '#0f9d58',
				warning: '#f4b400',
				error: '#db4437',
				background: '#ffffff',
				surface: '#f8f9fa'
			},
			typography: {
				headingFont: 'Inter',
				bodyFont: 'Inter',
				baseSize: '16px',
				scale: 1.2
			},
			spacing: {
				base: '8px',
				scale: 1.5
			},
			borderRadius: '4px'
		}
	});

	console.log('Branding settings seeded successfully');
}