export interface Collection {
  alfrescoId: string;
  parentAlfrescoId: string;
}

export interface Area {
  area: number;
  name: string;
  title: string;
  collection: Collection[];
}

export const prodCategories = [
  {
    key: 1,
    id: '5efd3f7d-9630-4d0d-877a-51f16bc9518a',
    name: 'Reittikirjatiedot',
    alfrescoId: '846eb15f-17dc-4f58-982e-b957d8b5ad38',
  },
  {
    key: 2,
    id: '91394bd7-8882-4111-adda-ef9d38109b5b',
    name: 'Rautatietunneleiden pelastussuunnitelmat',
    alfrescoId: '8688b89a-7898-4a38-b582-c6338a8547b5',
  },
  {
    key: 3,
    id: '88cd7dfc-13aa-45d7-b4d2-a094f5449f81',
    name: 'Ryhmityskaaviot',
    alfrescoId: '2526730d-16fa-4132-88ef-a3a2da5d16a5',
  },
  {
    key: 4,
    id: 'a8323a3a-8eff-49c1-98de-6a9daaaa4d7f',
    name: 'Kaluston valvontalaitteet',
    alfrescoId: '15d7d17c-2ef5-4208-838b-27fda7f5a293',
  },
  {
    key: 5,
    id: '150ac733-a87a-4328-829e-74e545b789e0',
    name: 'Rataomaisuusnumerot',
    alfrescoId: '4962b813-9756-4efe-bbf6-b4c488c43e80',
  },
  {
    key: 6,
    id: 'fa4f795b-2c47-4148-858d-36ac1408f6b0',
    name: 'Ratatietokartat',
    alfrescoId: '846eb15f-17dc-4f58-982e-b957d8b5ad38',
  },
  {
    key: 7,
    id: '52b70668-e245-483e-98ea-b19e31d8c2f4',
    name: 'Raiteistokaaviot',
    alfrescoId: '21f89c16-604e-46c9-b833-eb4d4e3265b0',
  },
  {
    key: 8,
    id: 'da3f5704-417b-4e54-b727-8fd10fe9407a',
    name: 'Liikennepaikkojen yhteystiedot',
    alfrescoId: '6e75d480-bf0c-4b05-b088-125d26cfee30',
  },
  {
    key: 9,
    id: '09e5e6dc-4486-4d86-9594-fdd74668b558',
    name: 'Turvalaitteiden käyttöohjeet',
    alfrescoId: '84823b29-dd36-438b-ac2d-91c907357fe1',
  },
  {
    key: 10,
    id: '3f7c47f7-de6a-4796-a1fe-43306f30bec1',
    name: 'RINF-rekisteri (ERADIS-tunnus)',
    alfrescoId: '24ff15ac-c1ac-404f-b5bc-6c32e2aa2543',
  },
  {
    key: 11,
    id: 'e327c52e-62a0-447e-9194-992674950205',
    name: 'Tunnelitiedot',
    alfrescoId: '2eb0bd96-14db-4a58-aeac-cce1188f7977',
  },
  {
    key: 12,
    id: 'eec096be-0c67-4a7d-8393-a604e925b504',
    name: 'Rautatieliikennepaikkojen kehitystarpeet',
    alfrescoId: 'aa3a1432-93a7-4e31-adec-18c63df6d83b',
  },
  {
    key: 13,
    id: 'fa90b7de-987d-44e0-a3b6-e689ede3076d',
    name: 'Linjakaaviot',
    alfrescoId: '2a668dba-7b3f-47f2-82f0-ccada03e9779',
  },
  {
    key: 14,
    id: 'bf77ba91-a705-40e0-944e-42a5df8ef635',
    name: 'Ratakuvapalvelu',
    alfrescoId: '470d39ac-b7bc-4fef-b1fc-7750376742e9',
  },
  {
    key: 15,
    id: '5d414668-620e-4ed2-a82a-c988870873e6',
    name: 'Liikenteenohjauksen yhteystiedot',
    alfrescoId: '41e1ec44-e1da-4eb3-9158-e53fb97d47d3',
  },
  {
    key: 16,
    id: '2adf5f7e-6709-433d-b6fb-5d07c5769647',
    name: 'Paikantamismerkit risteysasemilla',
    alfrescoId: '3be59326-4794-4681-b4ce-32507905182c',
  },
  {
    key: 17,
    id: 'ee602793-a7ac-4000-96ea-c2f2098c471c',
    name: 'Nopeuskaaviot',
    alfrescoId: '4f892a64-f6cf-4991-9bf1-8655d4880ed6',
  },
  {
    key: 18,
    id: '24272d94-482f-48d5-a72b-148f0e0cab0f',
    name: 'Hallintaraportit',
    alfrescoId: '9fbcde01-1527-46cd-bcba-3781480f8492',
  },
  {
    key: 19,
    id: '29189099-1cf6-4426-b0ff-280be231728f',
    name: 'Piirustusarkisto',
    alfrescoId: '5b6ba50c-3669-4c29-b043-dbc28e886f66',
  },
  {
    key: 20,
    id: '0550d314-270d-4fd7-aa78-8832d6ca7d0d',
    name: 'Liikennepaikkapäätökset',
    alfrescoId: 'ae7c082b-da5b-4e86-91d0-867e9f736b2e',
  },
  {
    key: 21,
    id: '84f760d1-590f-4780-ab63-0b21d430cb3e',
    name: 'Turvalaitteiden huolto-ohjeet',
    alfrescoId: '01c8c293-02c9-419f-9709-c7d03eccc2d1',
  },
  {
    key: 22,
    id: '681ff19d-6a90-4eba-9086-f6dceca6ebdc',
    name: 'Siltatarkastukset',
    alfrescoId: 'c3ad0d3d-0b54-4b8b-a5e8-3d229ee47155',
  },
  {
    key: 23,
    id: 'a3aef157-9376-4145-a554-94c87f53a243',
    name: 'VAK-ratapihat',
    alfrescoId: '2e33a089-70cd-4f05-abb7-3390939e85f1',
  },
  {
    key: 24,
    id: '58648982-57db-4e06-9fb3-d58402db76e8',
    name: 'Siltojen kiskotus- ja kunnossapito-ohjeet',
    alfrescoId: '3a4fc1a6-f392-44c9-b196-213bea0450eb',
  },
  {
    key: 25,
    id: '2da86168-eed3-4429-93b6-78415515cf49',
    name: 'Pienimuotoisen kuljettajatoiminnan aluerajaukset',
    alfrescoId: '69b4145c-1a3e-499c-9213-083651a0a19f',
  },
  {
    key: 26,
    id: '2da86168-eed3-4429-93b6-78415515cf49',
    name: 'Ratatietojen luokittelu',
    alfrescoId: '69b4145c-1a3e-499c-9213-083651a0a19f',
  },
];

export const devCategories = [
  {
    key: 1,
    id: '0e86d6ca-7300-4833-aab5-2b1a8d1f326d',
    name: 'Reittikirjatiedot',
    alfrescoId: '93ab89aa-589c-4703-b530-bea9f5cd5258',
  },
  {
    key: 2,
    id: '21554461-bde8-4a50-811b-a950e5d824a6',
    name: 'Rautatietunneleiden pelastussuunnitelmat',
    alfrescoId: '93bfa186-415a-4237-acc4-6351331a8c87',
  },
  {
    key: 3,
    id: '298215b5-8f85-4898-99a4-fda3d5647883',
    name: 'Ryhmityskaaviot',
    alfrescoId: '87b94280-b851-4345-b4af-3df5eec267b9',
  },
  {
    key: 4,
    id: '338be72b-6b08-4a6c-bbce-84cc18809aba',
    name: 'Kaluston valvontalaitteet',
    alfrescoId: '6a42017d-091d-4a42-a1f6-3c18207790c5',
  },
  {
    key: 5,
    id: '37ce2646-8c34-403b-87e7-0ea08a7a66e0',
    name: 'Rataomaisuusnumerot',
    alfrescoId: 'bab4fc44-ca14-4a17-bc61-8a9b4c99a437',
  },
  {
    key: 6,
    id: '3997282f-b25e-40ae-bded-f097e1130b1e',
    name: 'Ratatietokartat',
    alfrescoId: '9bec1a8a-006f-4cf0-b8c2-420286ff76c4',
  },
  {
    key: 7,
    id: '3b3dff52-9d72-4801-9750-0acc3dcc9d71',
    name: 'Raiteistokaaviot',
    alfrescoId: '6d86679c-4e59-42ed-bf97-61ef7e8e6593',
  },
  {
    key: 8,
    id: '42fb1989-dbbe-4b22-b03d-6ff4bfcd06ab',
    name: 'Liikennepaikkojen yhteystiedot',
    alfrescoId: '84c11673-218d-4113-a15e-808542371c28',
  },
  {
    key: 9,
    id: '481eb3a8-d084-4612-8712-c5df6ea89e9f',
    name: 'Turvalaitteiden käyttöohjeet',
    alfrescoId: 'f5444443-9404-415a-b7f3-8a2970c2cab9',
  },
  {
    key: 10,
    id: '60e85839-72e4-46b5-881a-0552129925b9',
    name: 'RINF-rekisteri (ERADIS-tunnus)',
    alfrescoId: 'c595c9ac-3c54-4b3b-b8bd-3cc5be929a91',
  },
  {
    key: 11,
    id: '69e0eed1-9102-4d44-a93f-789d045595aa',
    name: 'Tunnelitiedot',
    alfrescoId: '15222d43-008e-4f6a-acd6-fdce1ab8b754',
  },
  {
    key: 12,
    id: '6ee5981c-c07e-47de-bede-725f403ea694',
    name: 'Rautatieliikennepaikkojen kehitystarpeet',
    alfrescoId: 'c015aa3e-0f85-4da9-9285-79801cf503a2',
  },
  {
    key: 13,
    id: '76a2ce76-f0ee-4795-abc6-1b7425ece3b5',
    name: 'Linjakaaviot',
    alfrescoId: '71d157b0-6c81-4b55-ad99-d7bfbfd2d960',
  },
  {
    key: 14,
    id: '8afb5a4a-4452-4b5c-8983-6a24be10a716',
    name: 'Ratakuvapalvelu',
    alfrescoId: 'f6104f66-ed4d-4ccb-9ae4-6a3336400c8a',
  },
  {
    key: 15,
    id: '8c7e69bc-1d46-4cc6-844a-0f42b25a17b2',
    name: 'Liikenteenohjauksen yhteystiedot',
    alfrescoId: 'b9064e1e-4c7a-4c03-892f-8d858787f58d',
  },
  {
    key: 16,
    id: '932b6616-ef4f-4b23-b4ee-4d6321ddc0f1',
    name: 'Paikantamismerkit risteysasemilla',
    alfrescoId: '5414be4e-c291-473f-b5ab-0651f1a4ec0f',
  },
  {
    key: 17,
    id: 'a3872cb2-dbff-4476-8262-c72ee6328dd5',
    name: 'Nopeuskaaviot',
    alfrescoId: '62cd0aa9-831e-47cb-9f8b-d63a8302ddfe',
  },
  {
    key: 18,
    id: 'c00710ce-e225-44e9-a59d-e9b363b9b121',
    name: 'Hallintaraportit',
    alfrescoId: '70550ffb-8ed2-46a8-9464-2c815aa77f9c',
  },
  {
    key: 19,
    id: 'cc0ff0f9-273e-4401-b847-417fb6d9baa1',
    name: 'Piirustusarkisto',
    alfrescoId: '1007470b-fa6a-44d0-9639-6466e799922c',
  },
  {
    key: 20,
    id: 'ccd53c2b-b569-4698-9c26-117fe5528051',
    name: 'Liikennepaikkapäätökset',
    alfrescoId: 'd2f31b30-5ee1-4dd2-9d41-768d8d8be239',
  },
  {
    key: 21,
    id: 'ce3f91ef-e7e8-4b89-b78d-97092accf783',
    name: 'Turvalaitteiden huolto-ohjeet',
    alfrescoId: '69a4ff60-4972-4ef5-80cf-9948a4ce5a08',
  },
  {
    key: 22,
    id: 'd6240efe-2881-43c3-9f4b-9e95ffa3dacc',
    name: 'Siltatarkastukset',
    alfrescoId: 'df631178-462c-4be2-9c61-efb0058a1697',
  },
  {
    key: 23,
    id: 'e10bdfc9-ec20-45ac-add5-3b81f20c1845',
    name: 'VAK-ratapihat',
    alfrescoId: 'a97586e7-3156-472b-ab25-08bc3e5f4ea3',
  },
  {
    key: 24,
    id: 'f6c0cb9e-a48a-4850-b63a-157115a339bb',
    name: 'Siltojen kiskotus- ja kunnossapito-ohjeet',
    alfrescoId: 'f361d181-07f1-40ea-8e58-1975efbcb75d',
  },
  {
    key: 25,
    id: 'ff635b6d-3ce0-4562-9576-cbca7db956a7',
    name: 'Pienimuotoisen kuljettajatoiminnan aluerajaukset',
    alfrescoId: '393c41f1-eae7-4864-95ec-339fea6480ae',
  },
  {
    key: 26,
    id: '04834242-68aa-4404-8e4c-5c7aa363defe',
    name: 'Ratatietojen luokittelu',
    alfrescoId: 'b66ae651-7cf1-4bf7-be74-c4896d5cf3d2',
  },
];

export const prodAreas = [
  {
    area: 1,
    name: 'alue_1_uusimaa',
    title: 'Alue 1 Uusimaa',
    collection: [
      {
        alfrescoId: 'fee789d9-4129-4025-ac7e-6904aed6817e',
        parentAlfrescoId: '2a668dba-7b3f-47f2-82f0-ccada03e9779',
      },
      {
        alfrescoId: '8f3d61d1-73ff-4427-9386-02c96bc96916',
        parentAlfrescoId: '4f892a64-f6cf-4991-9bf1-8655d4880ed6',
      },
      {
        alfrescoId: '744811fd-c725-4a3e-aa69-6d6995d400f1',
        parentAlfrescoId: '21f89c16-604e-46c9-b833-eb4d4e3265b0',
      },
      {
        alfrescoId: '5fc22b65-7ff4-480b-a9b3-2dfc4c286ce5',
        parentAlfrescoId: '2526730d-16fa-4132-88ef-a3a2da5d16a5',
      },
      {
        alfrescoId: 'a266da9e-135c-4538-aaff-8f9a5607ae0c',
        parentAlfrescoId: '846eb15f-17dc-4f58-982e-b957d8b5ad38',
      },
      {
        alfrescoId: 'a3093f2e-deac-449c-aa89-2058de35a72e',
        parentAlfrescoId: '84823b29-dd36-438b-ac2d-91c907357fe1',
      },
      {
        alfrescoId: 'dd571031-4157-4d0b-a0a6-d637206277fa',
        parentAlfrescoId: 'c3ad0d3d-0b54-4b8b-a5e8-3d229ee47155',
      },
    ],
  },
  {
    area: 2,
    name: 'alue_2_lounaisrannikko',
    title: 'Alue 2 Lounaisrannikko',
    collection: [
      {
        alfrescoId: 'b5b4b781-e337-491c-acb2-4b46bf848673',
        parentAlfrescoId: '2a668dba-7b3f-47f2-82f0-ccada03e9779',
      },
      {
        alfrescoId: 'e07c8fb6-56f6-455e-8c7d-8598db099358',
        parentAlfrescoId: '4f892a64-f6cf-4991-9bf1-8655d4880ed6',
      },
      {
        alfrescoId: 'ce65e817-c82d-42aa-859e-3d5724d14a09',
        parentAlfrescoId: '21f89c16-604e-46c9-b833-eb4d4e3265b0',
      },
      {
        alfrescoId: 'ec99331e-59a0-4d59-85df-e6e2f2396d2d',
        parentAlfrescoId: '2526730d-16fa-4132-88ef-a3a2da5d16a5',
      },
      {
        alfrescoId: 'b1270b90-c159-4187-b369-a24acad876de',
        parentAlfrescoId: '846eb15f-17dc-4f58-982e-b957d8b5ad38',
      },
      {
        alfrescoId: '17437108-8e6d-46b3-8c68-ada6fa0fad80',
        parentAlfrescoId: '84823b29-dd36-438b-ac2d-91c907357fe1',
      },
      {
        alfrescoId: '4ea2caa6-b5b2-4bf1-a51e-ef8722a20627',
        parentAlfrescoId: 'c3ad0d3d-0b54-4b8b-a5e8-3d229ee47155',
      },
    ],
  },
  {
    area: 3,
    name: 'alue_3_riihimaki-seinajoki',
    title: 'Alue 3 Riihimäki-Seinäjoki',
    collection: [
      {
        alfrescoId: '8c067e74-d2ae-4ed7-b9cc-931be894d083',
        parentAlfrescoId: '2a668dba-7b3f-47f2-82f0-ccada03e9779',
      },
      {
        alfrescoId: '41f1504e-acd7-446e-af5a-693603421d1d',
        parentAlfrescoId: '4f892a64-f6cf-4991-9bf1-8655d4880ed6',
      },
      {
        alfrescoId: '97b3d0d4-f099-418d-ba74-18a8905270eb',
        parentAlfrescoId: '21f89c16-604e-46c9-b833-eb4d4e3265b0',
      },
      {
        alfrescoId: '16fa5c45-b1d8-4cee-ba6c-f5cc167db462',
        parentAlfrescoId: '2526730d-16fa-4132-88ef-a3a2da5d16a5',
      },
      {
        alfrescoId: '9c8cbe72-ebb5-487b-bc5c-c42c70992783',
        parentAlfrescoId: '846eb15f-17dc-4f58-982e-b957d8b5ad38',
      },
      {
        alfrescoId: '7c5730f5-7e4e-4a99-af97-c93225719061',
        parentAlfrescoId: '84823b29-dd36-438b-ac2d-91c907357fe1',
      },
      {
        alfrescoId: 'd6c2e6c0-0fab-4570-8f48-0a2ba436a831',
        parentAlfrescoId: 'c3ad0d3d-0b54-4b8b-a5e8-3d229ee47155',
      },
    ],
  },
  {
    area: 4,
    name: 'alue_4_rauma-pieksamaki',
    title: 'Alue 4 Rauma-Pieksämäki',
    collection: [
      {
        alfrescoId: '36288595-6448-42f9-bf73-81133a7a062b',
        parentAlfrescoId: '2a668dba-7b3f-47f2-82f0-ccada03e9779',
      },
      {
        alfrescoId: 'd8c689b0-df95-483e-8757-91508a65f21e',
        parentAlfrescoId: '4f892a64-f6cf-4991-9bf1-8655d4880ed6',
      },
      {
        alfrescoId: '1d26d2c2-aa7a-48c9-a3de-b211522b5c79',
        parentAlfrescoId: '21f89c16-604e-46c9-b833-eb4d4e3265b0',
      },
      {
        alfrescoId: '60481585-a9e6-4dea-ad01-4666daeecd5e',
        parentAlfrescoId: '2526730d-16fa-4132-88ef-a3a2da5d16a5',
      },
      {
        alfrescoId: 'c165bb0d-e2fa-4884-8456-390edebdf370',
        parentAlfrescoId: '846eb15f-17dc-4f58-982e-b957d8b5ad38',
      },
      {
        alfrescoId: '9f837b44-cd05-4e9d-bbf6-75d24ca20f3d',
        parentAlfrescoId: '84823b29-dd36-438b-ac2d-91c907357fe1',
      },
      {
        alfrescoId: '84f60960-1333-4299-969b-4bf4aef16535',
        parentAlfrescoId: 'c3ad0d3d-0b54-4b8b-a5e8-3d229ee47155',
      },
    ],
  },
  {
    area: 5,
    name: 'alue_5_haapamaen_tahti',
    title: 'Alue 5 Haapamäen tähti',
    collection: [
      {
        alfrescoId: 'ad909d4a-1c04-470d-9843-816ab29c4145',
        parentAlfrescoId: '2a668dba-7b3f-47f2-82f0-ccada03e9779',
      },
      {
        alfrescoId: 'e1bcbd91-829f-4a1d-94a9-b80b04b3262f',
        parentAlfrescoId: '4f892a64-f6cf-4991-9bf1-8655d4880ed6',
      },
      {
        alfrescoId: '59dc1deb-1c61-4303-ade8-b861e4069fde',
        parentAlfrescoId: '21f89c16-604e-46c9-b833-eb4d4e3265b0',
      },
      {
        alfrescoId: '7d634f67-18cf-48d0-8b9a-8ab981cdd8d4',
        parentAlfrescoId: '2526730d-16fa-4132-88ef-a3a2da5d16a5',
      },
      {
        alfrescoId: 'ced74023-4082-40f6-99f1-703c467f0376',
        parentAlfrescoId: '846eb15f-17dc-4f58-982e-b957d8b5ad38',
      },
      {
        alfrescoId: '1abbe7a0-e82e-43b7-9a42-48a667806ba9',
        parentAlfrescoId: '84823b29-dd36-438b-ac2d-91c907357fe1',
      },
      {
        alfrescoId: 'a925058f-8c31-4225-a3e9-04015d015937',
        parentAlfrescoId: 'c3ad0d3d-0b54-4b8b-a5e8-3d229ee47155',
      },
    ],
  },
  {
    area: 6,
    name: 'alue_6_savon_rata',
    title: 'Alue 6 Savon rata',
    collection: [
      {
        alfrescoId: '64d286b1-3f84-4db8-a9da-902f581761de',
        parentAlfrescoId: '2a668dba-7b3f-47f2-82f0-ccada03e9779',
      },
      {
        alfrescoId: '6465c5e5-664e-4b75-87f4-b29e17c2a34e',
        parentAlfrescoId: '4f892a64-f6cf-4991-9bf1-8655d4880ed6',
      },
      {
        alfrescoId: '7b6c8e68-4431-4573-8c5a-68ad49bdd84b',
        parentAlfrescoId: '21f89c16-604e-46c9-b833-eb4d4e3265b0',
      },
      {
        alfrescoId: '2106a1aa-025a-453d-a45d-a2c3db603421',
        parentAlfrescoId: '2526730d-16fa-4132-88ef-a3a2da5d16a5',
      },
      {
        alfrescoId: '6c3ea1fd-3461-4496-969b-fc132fc84720',
        parentAlfrescoId: '846eb15f-17dc-4f58-982e-b957d8b5ad38',
      },
      {
        alfrescoId: '4fa56d1a-6371-4718-9574-11b8777a0481',
        parentAlfrescoId: '84823b29-dd36-438b-ac2d-91c907357fe1',
      },
      {
        alfrescoId: '6a17cf90-5206-4f34-943a-6f6a54d25051',
        parentAlfrescoId: 'c3ad0d3d-0b54-4b8b-a5e8-3d229ee47155',
      },
    ],
  },
  {
    area: 7,
    name: 'alue_7_karjalan_rata',
    title: 'Alue 7 Karjalan rata',
    collection: [
      {
        alfrescoId: '309e128e-6767-4c4b-90d6-4a11163c0491',
        parentAlfrescoId: '2a668dba-7b3f-47f2-82f0-ccada03e9779',
      },
      {
        alfrescoId: '4d04b518-b190-4379-b2d9-b6477644b995',
        parentAlfrescoId: '4f892a64-f6cf-4991-9bf1-8655d4880ed6',
      },
      {
        alfrescoId: 'd432eeec-e603-4ca6-8cd9-32e943a6b2d9',
        parentAlfrescoId: '21f89c16-604e-46c9-b833-eb4d4e3265b0',
      },
      {
        alfrescoId: '10ab35c1-6450-4f11-9fb7-b01efec3f367',
        parentAlfrescoId: '2526730d-16fa-4132-88ef-a3a2da5d16a5',
      },
      {
        alfrescoId: '8befc164-766c-40be-9c38-e92a6916fadb',
        parentAlfrescoId: '846eb15f-17dc-4f58-982e-b957d8b5ad38',
      },
      {
        alfrescoId: '95bf781b-f3f8-4d62-9fa7-cbc4cd14f98a',
        parentAlfrescoId: '84823b29-dd36-438b-ac2d-91c907357fe1',
      },
      {
        alfrescoId: 'cefae085-527e-4ee1-aa9d-eeef5d53e902',
        parentAlfrescoId: 'c3ad0d3d-0b54-4b8b-a5e8-3d229ee47155',
      },
    ],
  },
  {
    area: 8,
    name: 'alue_8_ylasavo',
    title: 'Alue 8 Yläsavo',
    collection: [
      {
        alfrescoId: '64343edc-2c8b-4eec-816a-82c048d1b1fa',
        parentAlfrescoId: '2a668dba-7b3f-47f2-82f0-ccada03e9779',
      },
      {
        alfrescoId: '7cd21f3f-da75-40bc-9a32-9e4b1f67eced',
        parentAlfrescoId: '4f892a64-f6cf-4991-9bf1-8655d4880ed6',
      },
      {
        alfrescoId: 'a40502a5-d712-4cf0-9619-ab1a913413ba',
        parentAlfrescoId: '21f89c16-604e-46c9-b833-eb4d4e3265b0',
      },
      {
        alfrescoId: '3647f93c-7d8f-47f5-a0fc-06085c43e0ff',
        parentAlfrescoId: '2526730d-16fa-4132-88ef-a3a2da5d16a5',
      },
      {
        alfrescoId: '0cb5d65f-e0d6-4044-9103-3b024a3ecbdb',
        parentAlfrescoId: '846eb15f-17dc-4f58-982e-b957d8b5ad38',
      },
      {
        alfrescoId: '072fcd9c-305c-4851-8056-f3c3e30c29e4',
        parentAlfrescoId: '84823b29-dd36-438b-ac2d-91c907357fe1',
      },
      {
        alfrescoId: '39e4dd1a-14d2-4961-bf08-62cea3b25763',
        parentAlfrescoId: 'c3ad0d3d-0b54-4b8b-a5e8-3d229ee47155',
      },
    ],
  },
  {
    area: 9,
    name: 'alue_9_pohjanmaan_rata',
    title: 'Alue 9 Pohjanmaan rata',
    collection: [
      {
        alfrescoId: 'd8af6a25-736e-477b-b80d-b80fa4fcff9c',
        parentAlfrescoId: '2a668dba-7b3f-47f2-82f0-ccada03e9779',
      },
      {
        alfrescoId: '7b884ef6-1441-42b3-9685-d3a1f17e159c',
        parentAlfrescoId: '4f892a64-f6cf-4991-9bf1-8655d4880ed6',
      },
      {
        alfrescoId: '64518658-788e-46f9-a0ef-85a9a07c7e8c',
        parentAlfrescoId: '21f89c16-604e-46c9-b833-eb4d4e3265b0',
      },
      {
        alfrescoId: '889f4b10-c8cb-4490-821c-e21e524a5595',
        parentAlfrescoId: '2526730d-16fa-4132-88ef-a3a2da5d16a5',
      },
      {
        alfrescoId: '82c49f5f-4d41-401d-922e-1f3589de7b6c',
        parentAlfrescoId: '846eb15f-17dc-4f58-982e-b957d8b5ad38',
      },
      {
        alfrescoId: '309ac3c5-c799-43e6-b1fd-df3cc50716b1',
        parentAlfrescoId: '84823b29-dd36-438b-ac2d-91c907357fe1',
      },
      {
        alfrescoId: '2978ffc2-0441-44fa-a540-4c600b519992',
        parentAlfrescoId: 'c3ad0d3d-0b54-4b8b-a5e8-3d229ee47155',
      },
    ],
  },
  {
    area: 10,
    name: 'alue_10_keski-suomi',
    title: 'Alue 10 Keski-Suomi',
    collection: [
      {
        alfrescoId: '3388849c-6211-4ca1-8a79-9495697fd5d8',
        parentAlfrescoId: '2a668dba-7b3f-47f2-82f0-ccada03e9779',
      },
      {
        alfrescoId: '8ee8b5fc-6f57-4f32-9849-8635ada4974c',
        parentAlfrescoId: '4f892a64-f6cf-4991-9bf1-8655d4880ed6',
      },
      {
        alfrescoId: '47cf8bba-8cda-4f14-9f00-49539792bb20',
        parentAlfrescoId: '21f89c16-604e-46c9-b833-eb4d4e3265b0',
      },
      {
        alfrescoId: '29b57cce-d815-4058-85ac-b3c043cb7969',
        parentAlfrescoId: '846eb15f-17dc-4f58-982e-b957d8b5ad38',
      },
      {
        alfrescoId: 'f13ed686-db37-42b6-854a-206396ce30a0',
        parentAlfrescoId: '84823b29-dd36-438b-ac2d-91c907357fe1',
      },
      {
        alfrescoId: 'ab11e6ce-f985-4718-afac-f4df21dbf9c7',
        parentAlfrescoId: 'c3ad0d3d-0b54-4b8b-a5e8-3d229ee47155',
      },
    ],
  },
  {
    area: 11,
    name: 'alue_11_kainuu-oulu',
    title: 'Alue 11 Kainuu-Oulu',
    collection: [
      {
        alfrescoId: 'b4c3eda9-274d-4ddb-8b82-de1ae102df2b',
        parentAlfrescoId: '2a668dba-7b3f-47f2-82f0-ccada03e9779',
      },
      {
        alfrescoId: 'b538c12b-8437-4384-b0f3-44d3e4d185a4',
        parentAlfrescoId: '4f892a64-f6cf-4991-9bf1-8655d4880ed6',
      },
      {
        alfrescoId: '70217964-71ac-485f-a12c-e1b8cc4ad602',
        parentAlfrescoId: '21f89c16-604e-46c9-b833-eb4d4e3265b0',
      },
      {
        alfrescoId: '3515cff3-eb71-4e6b-9ef8-ad7429a815c1',
        parentAlfrescoId: '2526730d-16fa-4132-88ef-a3a2da5d16a5',
      },
      {
        alfrescoId: 'bbb7e0bb-6e41-4d8a-8a54-0462a86c7ae8',
        parentAlfrescoId: '846eb15f-17dc-4f58-982e-b957d8b5ad38',
      },
      {
        alfrescoId: 'cb6ffbed-9891-4280-998c-ae71c92c2f93',
        parentAlfrescoId: '84823b29-dd36-438b-ac2d-91c907357fe1',
      },
      {
        alfrescoId: '6579cef9-54c6-49c2-b971-385eb13a88a0',
        parentAlfrescoId: 'c3ad0d3d-0b54-4b8b-a5e8-3d229ee47155',
      },
    ],
  },
  {
    area: 12,
    name: 'alue_12_oulu-lappi',
    title: 'Alue 12 Oulu-Lappi',
    collection: [
      {
        alfrescoId: '6d45449d-a1e0-416b-b55f-94fa15a4ef74',
        parentAlfrescoId: '2a668dba-7b3f-47f2-82f0-ccada03e9779',
      },
      {
        alfrescoId: 'e66ea6c1-5fbb-4e81-b3f8-1bb05d95c9e1',
        parentAlfrescoId: '4f892a64-f6cf-4991-9bf1-8655d4880ed6',
      },
      {
        alfrescoId: '1fc00352-974b-423e-a899-dae761c2b717',
        parentAlfrescoId: '21f89c16-604e-46c9-b833-eb4d4e3265b0',
      },
      {
        alfrescoId: '515ac03d-ee4c-42b6-b32c-a39e2dc8a48a',
        parentAlfrescoId: '2526730d-16fa-4132-88ef-a3a2da5d16a5',
      },
      {
        alfrescoId: '66f12f9e-5221-422c-9c6e-83b899a5ccec',
        parentAlfrescoId: '846eb15f-17dc-4f58-982e-b957d8b5ad38',
      },
      {
        alfrescoId: '9fb517ab-f34d-4e52-960b-18430a1ec9c4',
        parentAlfrescoId: '84823b29-dd36-438b-ac2d-91c907357fe1',
      },
      {
        alfrescoId: '574f155d-ec2c-4d09-9c8b-e82b36b87249',
        parentAlfrescoId: 'c3ad0d3d-0b54-4b8b-a5e8-3d229ee47155',
      },
    ],
  },
];

export const devAreas = [
  {
    area: 1,
    name: 'alue_1_uusimaa',
    title: 'Alue 1 Uusimaa',
    collection: [
      {
        alfrescoId: '70bd7ac9-4069-48b3-a205-c08569778b87',
        parentAlfrescoId: '71d157b0-6c81-4b55-ad99-d7bfbfd2d960',
      },
    ],
  },
  {
    area: 2,
    name: 'alue_2_lounaisrannikko',
    title: 'Alue 2 Lounaisrannikko',
    collection: [
      {
        alfrescoId: '49af2913-aca9-45e0-a261-2ba8c2731ece',
        parentAlfrescoId: '71d157b0-6c81-4b55-ad99-d7bfbfd2d960',
      },
    ],
  },
  {
    area: 3,
    name: 'alue_3_riihimaki-seinajoki',
    title: 'Alue 3 Riihimäki-Seinäjoki',
    collection: [
      {
        alfrescoId: 'c8bdd537-40fa-4ee6-9d5f-2db4d9363d38',
        parentAlfrescoId: '71d157b0-6c81-4b55-ad99-d7bfbfd2d960',
      },
    ],
  },
  {
    area: 4,
    name: 'alue_4_rauma-pieksamaki',
    title: 'Alue 4 Rauma-Pieksämäki',
    collection: [
      {
        alfrescoId: 'b5893ea1-abf1-418e-853e-801d8b4b83f6',
        parentAlfrescoId: '71d157b0-6c81-4b55-ad99-d7bfbfd2d960',
      },
    ],
  },
  {
    area: 5,
    name: 'alue_5_haapamaen_tahti',
    title: 'Alue 5 Haapamäen tähti',
    collection: [
      {
        alfrescoId: '5903aed6-ee6f-4bf0-a940-52cf16618d32',
        parentAlfrescoId: '71d157b0-6c81-4b55-ad99-d7bfbfd2d960',
      },
    ],
  },
  {
    area: 6,
    name: 'alue_6_savon_rata',
    title: 'Alue 6 Savon rata',
    collection: [
      {
        alfrescoId: 'f3ea7b5f-dc0c-4177-ad0e-dfe61cb05a49',
        parentAlfrescoId: '71d157b0-6c81-4b55-ad99-d7bfbfd2d960',
      },
    ],
  },
  {
    area: 7,
    name: 'alue_7_karjalan_rata',
    title: 'Alue 7 Karjalan rata',
    collection: [
      {
        alfrescoId: 'f514ac57-7646-4608-829f-c6f567c9b49c',
        parentAlfrescoId: '71d157b0-6c81-4b55-ad99-d7bfbfd2d960',
      },
    ],
  },
  {
    area: 8,
    name: 'alue_8_ylasavo',
    title: 'Alue 8 Yläsavo',
    collection: [
      {
        alfrescoId: '3d897f08-1903-46ff-a624-be2de6755b14',
        parentAlfrescoId: '71d157b0-6c81-4b55-ad99-d7bfbfd2d960',
      },
    ],
  },
  {
    area: 9,
    name: 'alue_9_pohjanmaan_rata',
    title: 'Alue 9 Pohjanmaan rata',
    collection: [
      {
        alfrescoId: 'f6f73ec9-0b91-48ee-b910-527c4e1acc16',
        parentAlfrescoId: '71d157b0-6c81-4b55-ad99-d7bfbfd2d960',
      },
      {
        alfrescoId: 'ba100335-4462-42a3-ab00-8a97e2a8d909',
        parentAlfrescoId: '87b94280-b851-4345-b4af-3df5eec267b9',
      },
    ],
  },
  {
    area: 10,
    name: 'alue_10_keski-suomi',
    title: 'Alue 10 Keski-Suomi',
    collection: [
      {
        alfrescoId: 'a29a5875-a876-43e4-a241-d8d4dd17cecc',
        parentAlfrescoId: '71d157b0-6c81-4b55-ad99-d7bfbfd2d960',
      },
    ],
  },
  {
    area: 11,
    name: 'alue_11_kainuu-oulu',
    title: 'Alue 11 Kainuu-Oulu',
    collection: [
      {
        alfrescoId: 'fadc764f-1059-47f9-9e76-03777800e0a8',
        parentAlfrescoId: '71d157b0-6c81-4b55-ad99-d7bfbfd2d960',
      },
    ],
  },
  {
    area: 12,
    name: 'alue_12_oulu-lappi',
    title: 'Alue 12 Oulu-Lappi',
    collection: [
      {
        alfrescoId: 'eb553836-0379-482d-b624-901f369b7267',
        parentAlfrescoId: '71d157b0-6c81-4b55-ad99-d7bfbfd2d960',
      },
    ],
  },
];
