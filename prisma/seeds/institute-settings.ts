import { PrismaClient } from '@prisma/client';

export async function seedInstituteSettings(prisma: PrismaClient) {
	console.log('Seeding institute settings...');

	await prisma.instituteSettings.upsert({
		where: { id: 1 },
		update: {},
		create: {
			name: 'Demo International School',
			address: '123 Education Street, Learning City, 12345',
			phone: '+1-234-567-8900',
			email: 'contact@demointernationalschool.edu',
			website: 'https://www.demointernationalschool.edu',
			logo: 'https://example.com/school-logo.png',
			timezone: 'UTC',
			academicYearStart: new Date('2024-08-01'),
			academicYearEnd: new Date('2025-05-31')
		}
	});

	console.log('Institute settings seeded successfully');
}