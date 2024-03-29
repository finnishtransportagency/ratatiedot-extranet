import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
  await prisma.categoryDataBase.upsert({
    where: { id: 'f0093c24-cece-11ed-afa1-0242ac120002' },
    update: {},
    create: {
      id: 'f0093c24-cece-11ed-afa1-0242ac120002',
      rataextraRequestPage: 'hallintaraportit',
      alfrescoFolder: '6a1200cb-5fc9-4364-b9bb-645c64c9e31e',
      writeRights: 'Ratatieto_kirjoitus_hallintaraportit',
      categoryDataContents: {
        create: {
          fields: [
            {
              type: 'notification_info',
              children: [
                {
                  type: 'paragraph-two',
                  children: [
                    { text: 'Hallintaraportit: vieraile virallisella ' },
                    { href: 'https://vayla.fi/', type: 'link', children: [{ text: 'sivulla', color: '#49C2F1' }] },
                    { text: '. Tervetuloa!' },
                  ],
                },
              ],
            },
          ],
        },
      },
      categoryComponents: {
        create: [
          {
            node: {
              create: {
                type: 'File',
                title: 'File List Component',
                alfrescoNodeId: '6bae6e4c-efd2-4d55-8560-cf2f2cc2ce8b',
              },
            },
          },
          {
            node: {
              create: {
                type: 'Folder',
                title: 'Folder List Component',
                alfrescoNodeId: '6a1200cb-5fc9-4364-b9bb-645c64c9e31e',
              },
            },
          },
          {
            node: {
              create: { type: 'Map', title: 'Map Component', alfrescoNodeId: '6bae6e4c-efd2-4d55-8560-cf2f2cc2ce8b' },
            },
          },
          {
            card: {
              create: {
                title: 'Basic Card Component',
                content: {
                  fields: [
                    {
                      type: 'paragraph-two',
                      children: [{ text: 'Text content' }],
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
