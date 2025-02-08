import { PrismaClient } from '@prisma/client';

export async function seedSystemSettings(prisma: PrismaClient) {
	console.log('Seeding system settings...');

	await prisma.systemSettings.upsert({
		where: { id: 1 },
		update: {},
		create: {
			mfaEnabled: true,
			emailNotifications: true,
			autoBackup: true,
			maintenanceMode: false
		}
	});

	console.log('System settings seeded successfully');
}