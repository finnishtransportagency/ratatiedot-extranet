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

export const categories = [
  {
    id: '0e86d6ca-7300-4833-aab5-2b1a8d1f326d',
    name: 'Reittikirjatiedot',
    alfrescoId: '93ab89aa-589c-4703-b530-bea9f5cd5258',
  },
  {
    id: '21554461-bde8-4a50-811b-a950e5d824a6',
    name: 'Rautatietunneleiden pelastussuunnitelmat',
    alfrescoId: '93bfa186-415a-4237-acc4-6351331a8c87',
  },
  {
    id: '298215b5-8f85-4898-99a4-fda3d5647883',
    name: 'Ryhmityskaaviot',
    alfrescoId: '87b94280-b851-4345-b4af-3df5eec267b9',
  },
  {
    id: '338be72b-6b08-4a6c-bbce-84cc18809aba',
    name: 'Kaluston valvontalaitteet',
    alfrescoId: '6a42017d-091d-4a42-a1f6-3c18207790c5',
  },
  {
    id: '37ce2646-8c34-403b-87e7-0ea08a7a66e0',
    name: 'Rataomaisuusnumerot',
    alfrescoId: 'bab4fc44-ca14-4a17-bc61-8a9b4c99a437',
  },
  {
    id: '3997282f-b25e-40ae-bded-f097e1130b1e',
    name: 'Ratatietokartat',
    alfrescoId: '9bec1a8a-006f-4cf0-b8c2-420286ff76c4',
  },
  {
    id: '3b3dff52-9d72-4801-9750-0acc3dcc9d71',
    name: 'Raiteistokaaviot',
    alfrescoId: '6d86679c-4e59-42ed-bf97-61ef7e8e6593',
  },
  {
    id: '42fb1989-dbbe-4b22-b03d-6ff4bfcd06ab',
    name: 'Liikennepaikkojen yhteystiedot',
    alfrescoId: '84c11673-218d-4113-a15e-808542371c28',
  },
  {
    id: '481eb3a8-d084-4612-8712-c5df6ea89e9f',
    name: 'Turvalaitteiden käyttoohjeet',
    alfrescoId: 'f5444443-9404-415a-b7f3-8a2970c2cab9',
  },
  {
    id: '60e85839-72e4-46b5-881a-0552129925b9',
    name: 'Rinf rekisteri',
    alfrescoId: 'c595c9ac-3c54-4b3b-b8bd-3cc5be929a91',
  },
  {
    id: '69e0eed1-9102-4d44-a93f-789d045595aa',
    name: 'Tunnelitiedot',
    alfrescoId: '15222d43-008e-4f6a-acd6-fdce1ab8b754',
  },
  {
    id: '6ee5981c-c07e-47de-bede-725f403ea694',
    name: 'Rautatieliikennepaikkojen kehitystarpeet',
    alfrescoId: 'c015aa3e-0f85-4da9-9285-79801cf503a2',
  },
  {
    id: '76a2ce76-f0ee-4795-abc6-1b7425ece3b5',
    name: 'Linjakaaviot',
    alfrescoId: '71d157b0-6c81-4b55-ad99-d7bfbfd2d960',
  },
  {
    id: '8afb5a4a-4452-4b5c-8983-6a24be10a716',
    name: 'Ratakuvapalvelu',
    alfrescoId: 'f6104f66-ed4d-4ccb-9ae4-6a3336400c8a',
  },
  {
    id: '8c7e69bc-1d46-4cc6-844a-0f42b25a17b2',
    name: 'Liikenteenohjauksen yhteystiedot',
    alfrescoId: 'b9064e1e-4c7a-4c03-892f-8d858787f58d',
  },
  {
    id: '932b6616-ef4f-4b23-b4ee-4d6321ddc0f1',
    name: 'Paikantamismerkit risteysasemilla',
    alfrescoId: '5414be4e-c291-473f-b5ab-0651f1a4ec0f',
  },
  {
    id: 'a3872cb2-dbff-4476-8262-c72ee6328dd5',
    name: 'Nopeuskaaviot',
    alfrescoId: '62cd0aa9-831e-47cb-9f8b-d63a8302ddfe',
  },
  {
    id: 'c00710ce-e225-44e9-a59d-e9b363b9b121',
    name: 'Hallintaraportit',
    alfrescoId: '70550ffb-8ed2-46a8-9464-2c815aa77f9c',
  },
  {
    id: 'cc0ff0f9-273e-4401-b847-417fb6d9baa1',
    name: 'Piirustusarkisto',
    alfrescoId: '1007470b-fa6a-44d0-9639-6466e799922c',
  },
  {
    id: 'ccd53c2b-b569-4698-9c26-117fe5528051',
    name: 'Liikennepaikkapäätokset',
    alfrescoId: 'd2f31b30-5ee1-4dd2-9d41-768d8d8be239',
  },
  {
    id: 'ce3f91ef-e7e8-4b89-b78d-97092accf783',
    name: 'Turvalaitteiden huolto-ohjeet',
    alfrescoId: '69a4ff60-4972-4ef5-80cf-9948a4ce5a08',
  },
  {
    id: 'd6240efe-2881-43c3-9f4b-9e95ffa3dacc',
    name: 'Siltatarkastukset',
    alfrescoId: 'df631178-462c-4be2-9c61-efb0058a1697',
  },
  {
    id: 'e10bdfc9-ec20-45ac-add5-3b81f20c1845',
    name: 'Vak-ratapihat',
    alfrescoId: 'a97586e7-3156-472b-ab25-08bc3e5f4ea3',
  },
  {
    id: 'f6c0cb9e-a48a-4850-b63a-157115a339bb',
    name: 'Siltojen kiskotus- ja kunnossapito-ohjeet',
    alfrescoId: 'f361d181-07f1-40ea-8e58-1975efbcb75d',
  },
  {
    id: 'ff635b6d-3ce0-4562-9576-cbca7db956a7',
    name: 'Pienimuotoisen kuljettajatoiminnan aluerajaukset',
    alfrescoId: '393c41f1-eae7-4864-95ec-339fea6480ae',
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
    ],
  },
  {
    area: 3,
    name: 'alue_3_riihimaki-seinajoki',
    title: 'Alue 3 Riihimaki-Seinajoki',
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
        alfrescoId: '7c5730f5-7e4e-4a99-af97-c93225719061',
        parentAlfrescoId: '84823b29-dd36-438b-ac2d-91c907357fe1',
      },
    ],
  },
  {
    area: 4,
    name: 'alue_4_rauma-pieksamaki',
    title: 'Alue 4 Rauma-Pieksamaki',
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
    title: 'Alue 4 Rauma-Pieksämaki',
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
