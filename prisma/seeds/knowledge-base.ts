import { PrismaClient } from '@prisma/client';

export async function seedKnowledgeBase(prisma: PrismaClient) {
	console.log('Seeding knowledge base...');

	// Create main knowledge base
	const knowledgeBase = await prisma.knowledgeBase.upsert({
		where: { id: 'main-kb' },
		update: {},
		create: {
			id: 'main-kb',
			name: 'School Knowledge Base',
			description: 'Central repository for school documentation and resources'
		}
	});

	// Create root folders
	const folders = await Promise.all([
		prisma.folder.upsert({
			where: { id: 'policies' },
			update: {},
			create: {
				id: 'policies',
				name: 'School Policies',
				description: 'Official school policies and procedures',
				knowledgeBaseId: knowledgeBase.id,
				metadata: {
					category: 'ADMINISTRATIVE',
					accessLevel: 'ALL'
				}
			}
		}),
		prisma.folder.upsert({
			where: { id: 'curriculum' },
			update: {},
			create: {
				id: 'curriculum',
				name: 'Curriculum Resources',
				description: 'Teaching and learning materials',
				knowledgeBaseId: knowledgeBase.id,
				metadata: {
					category: 'ACADEMIC',
					accessLevel: 'STAFF'
				}
			}
		})
	]);

	// Create sample documents
	await Promise.all([
		prisma.document.create({
			data: {
				title: 'Student Handbook',
				type: 'POLICY',
				content: 'This is the student handbook content...',
				embeddings: [],
				metadata: {
					version: '1.0',
					lastReviewed: new Date().toISOString(),
					status: 'PUBLISHED'
				},
				folderId: folders[0].id,
				knowledgeBaseId: knowledgeBase.id
			}
		}),
		prisma.document.create({
			data: {
				title: 'Teaching Guidelines',
				type: 'GUIDE',
				content: 'Best practices for teaching and assessment...',
				embeddings: [],
				metadata: {
					version: '2.1',
					lastReviewed: new Date().toISOString(),
					status: 'PUBLISHED'
				},
				folderId: folders[1].id,
				knowledgeBaseId: knowledgeBase.id
			}
		})
	]);

	console.log('Knowledge base seeded successfully');
}