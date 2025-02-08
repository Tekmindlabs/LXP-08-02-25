import { PrismaClient, UserType, Status } from '@prisma/client';
import { Permissions, DefaultRoles } from '../../src/utils/permissions';

export async function seedUsers(prisma: PrismaClient) {
	console.log('Creating demo users...');
	
	// Get super admin role
	const superAdminRole = await prisma.role.findUnique({
		where: { name: DefaultRoles.SUPER_ADMIN }
	});

	if (!superAdminRole) {
		throw new Error('Super admin role not found. Please run permissions seed first.');
	}

	// Create super admin user
	await prisma.user.upsert({
		where: { email: 'superadmin@example.com' },
		update: {},
		create: {
			name: 'Super Admin',
			email: 'superadmin@example.com',
			userType: UserType.ADMIN,
			status: Status.ACTIVE,
			userRoles: {
				create: {
					roleId: superAdminRole.id
				}
			}
		}
	});

	// Create or get existing roles
	const roleNames = ['ADMIN', 'TEACHER', 'STUDENT'];
	const roles = await Promise.all(
		roleNames.map(async (name) => {
			const existingRole = await prisma.role.findUnique({
				where: { name }
			});
			
			if (existingRole) return existingRole;
			
			return prisma.role.create({
				data: {
					name,
					description: `${name.charAt(0) + name.slice(1).toLowerCase()} Role`
				}
			});
		})
	);

	// Create users with profiles
	const users = await Promise.all([
		// Admin
		prisma.user.upsert({
			where: { email: 'admin@school.com' },
			update: {},
			create: {
				name: 'Admin User',
				email: 'admin@school.com',
				userType: UserType.ADMIN,
				status: Status.ACTIVE,
				userRoles: {
					create: {
						roleId: roles[0].id
					}
				}
			}
		}),
		// Teachers
		prisma.user.upsert({
			where: { email: 'teacher1@school.com' },
			update: {},
			create: {
				name: 'John Teacher',
				email: 'teacher1@school.com',
				userType: UserType.TEACHER,
				status: Status.ACTIVE,
				teacherProfile: {
					create: {
						specialization: 'Mathematics'
					}
				},
				userRoles: {
					create: {
						roleId: roles[1].id
					}
				}
			}
		}),
		prisma.user.upsert({
			where: { email: 'teacher2@school.com' },
			update: {},
			create: {
				name: 'Jane Teacher',
				email: 'teacher2@school.com',
				userType: UserType.TEACHER,
				status: Status.ACTIVE,
				teacherProfile: {
					create: {
						specialization: 'Science'
					}
				},
				userRoles: {
					create: {
						roleId: roles[1].id
					}
				}
			}
		}),
		// Students
		prisma.user.upsert({
			where: { email: 'student1@school.com' },
			update: {},
			create: {
				name: 'Student One',
				email: 'student1@school.com',
				userType: UserType.STUDENT,
				status: Status.ACTIVE,
				studentProfile: {
					create: {
						dateOfBirth: new Date('2010-01-01')
					}
				},
				userRoles: {
					create: {
						roleId: roles[2].id
					}
				}
			}
		}),
		prisma.user.upsert({
			where: { email: 'student2@school.com' },
			update: {},
			create: {
				name: 'Student Two',
				email: 'student2@school.com',
				userType: UserType.STUDENT,
				status: Status.ACTIVE,
				studentProfile: {
					create: {
						dateOfBirth: new Date('2010-06-15')
					}
				},
				userRoles: {
					create: {
						roleId: roles[2].id
					}
				}
			}
		})
	]);

	return users;
}