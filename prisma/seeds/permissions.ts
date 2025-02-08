import { PrismaClient } from '@prisma/client';
import { Permissions, DefaultRoles } from '@/utils/permissions';

export async function seedPermissions(prisma: PrismaClient) {
	console.log('Seeding permissions and roles...');

	// Create all permissions
	const permissions = await Promise.all(
		Object.values(Permissions).map(async (permissionName) => {
			return prisma.permission.upsert({
				where: { name: permissionName },
				update: {},
				create: {
					name: permissionName,
					description: `Permission to ${permissionName.toLowerCase().replace(':', ' ')}`
				}
			});
		})
	);

	// Create super admin role with all permissions
	const superAdminRole = await prisma.role.upsert({
		where: { name: DefaultRoles.SUPER_ADMIN },
		update: {},
		create: {
			name: DefaultRoles.SUPER_ADMIN,
			description: 'Super Administrator with all permissions',
			permissions: {
				create: permissions.map(permission => ({
					permission: { connect: { id: permission.id } }
				}))
			}
		}
	});

	console.log('Permissions and roles seeded successfully');
	return { permissions, superAdminRole };
}