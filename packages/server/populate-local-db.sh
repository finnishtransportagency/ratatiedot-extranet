#! /bin/bash
set -a; source .env; set +a
psql -h $LOCAL_IP -p $DB_PORT -d $DATABASE_NAME -U $DATABASE_USER << END_OF_SCRIPT
TRUNCATE "CategoryDataContents", "CategoryDataBase" restart identity;

INSERT INTO "CategoryDataBase" ("rataextraRequestPage", "alfrescoFolder", "writeRights")
VALUES
('linjakaaviot', 'e5ab4633-c8e6-43b3-9e12-4e8686043609', 'Rataextra_kirjoitus_linjakaaviot'),
('nopeuskaaviot', '15697da3-e4e0-49d9-927e-100238bfd023', 'Ratatieto_kirjoitus_nopeuskaaviot'),
('raiteistokaaviot', 'aa9f0a51-e15c-478a-8bb2-f14d0e7101e6', 'Ratatieto_kirjoitus_raiteistokaaviot'),
('ryhmityskaaviot', '294deb88-06a9-4e03-9794-5d2ec102e002', 'Ratatieto_kirjoitus_ryhmityskaaviot'),
('liikennepaikkapaatokset', '42d8f660-15d2-4c06-adcd-73806a5f074f', 'Ratatieto_kirjoitus_liikennepaikkapaatokset'),
('paikantamismerkit-risteysasemilla', '58672633-cf65-4a2b-99c8-cf074ebcc8cb', 'Ratatieto_kirjoitus_paikantamismerkit_risteysasemilla'),
('rataomaisuusnumerot', '3b776921-3cda-4e0d-907a-b5e9ae8d9251', 'Ratatieto_kirjoitus_rataomaisuusnumerot'),
('ratatietokartat', '61a4282a-236c-4c41-8e4c-8ad10884446a', 'Ratatieto_kirjoitus_ratatietokartat'),
('rautatieliikennepaikkojen-kehitystarpeet', '688adb20-4470-4790-95e1-86b3cee13f61', 'Ratatieto_kirjoitus_rautatieliikennepaikkojen_kehitystarpeet'),
('reittikirjatiedot', 'fb477102-b19d-4498-a134-297021d05fe1', 'Ratatieto_kirjoitus_reittikirjatiedot'),
('rinf-rekisteri-eradis-tunnus', '8f3a814c-6fe2-49fa-806a-b334a04a68fb', 'Ratatieto_kirjoitus_rinf_rekisteri_eradis_tunnus'),
('vak-ratapihat', 'ea96a3b2-da1f-4a57-91ab-854685f541df', 'Ratatieto_kirjoitus_vak_ratapihat'),
('siltatarkastukset', 'da9691e0-61e8-4e7c-b6b1-d31ea00e146f', 'Ratatieto_kirjoitus_siltatarkastukset'),
('siltojen-kiskotus--ja-kunnossapito-ohjeet', 'c267faa6-616d-4a8f-8809-62043c94c035', 'Ratatieto_kirjoitus_siltojen_kiskotus_ja_kunnossapito_ohjeet'),
('tunnelitiedot', 'edded9cd-f14f-43b1-b14b-d21a92cdf2da', 'Ratatieto_kirjoitus_tunnelitiedot'),
('rautatietunneleiden-pelastussuunnitelmat', '002334d3-f3c5-4bf0-9027-fc791ffeafde', 'Ratatieto_kirjoitus_rautatietunneleiden_pelastussuunnitelmat'),
('turvalaitteiden-huolto-ohjeet', '05c5cd11-fe30-4637-a819-f4236b67af0a', 'Ratatieto_kirjoitus_turvalaitteiden_huolto_ohjeet'),
('turvalaitteiden-kayttoohjeet', 'aea2af06-5681-4def-8942-0ad7cd27bb13', 'Ratatieto_kirjoitus_turvalaitteiden_käyttoohjeet'),
('liikennepaikkojen-yhteystiedot', '6e49cab2-b923-420c-99cc-5926cb0a6375', 'Ratatieto_kirjoitus_liikennepaikkojen_yhteystiedot'),
('liikenteenohjauksen-yhteystiedot', 'f4276718-da9a-4fa5-a113-39c155ff6363', 'Ratatieto_kirjoitus_liikenteenohjauksen_yhteystiedot'),
('hallintaraportit', '6a1200cb-5fc9-4364-b9bb-645c64c9e31e', 'Ratatieto_kirjoitus_hallintaraportit'),
('kaluston-valvontalaitteet', '02013779-fd93-4881-b92f-e13c0626ff12', 'Ratatieto_kirjoitus_kaluston_valvontalaitteet'),
('pienimuotoisen-kuljettajatoiminnan-aluerajaukset', '668c75a8-6b4f-4346-a17f-6f4e26f5fbf1', 'Ratatieto_kirjoitus_pienimuotoisen_kuljettajatoiminnan_aluerajaukset'),
('piirustusarkisto', '011eea3f-2578-4cb8-af28-8a30d41db693', 'Ratatieto_kirjoitus_piirustusarkisto'),
('ratakuvapalvelu', '6d26eb2d-7b4a-4191-a379-589a2ae87988', 'Ratatieto_kirjoitus_ratakuvapalvelu');

INSERT INTO "CategoryDataContents" ("baseId", "fields")
VALUES
(1, '{}'),
(2, '{}'),
(3, '{}'),
(4, '{}'),
(5, '{}'),
(6, '{}'),
(7, '{}'),
(8, '{}'),
(9, '{}'),
(10, '{}'),
(11, '{}'),
(12, '{}'),
(13, '{}'),
(14, '{}'),
(15, '{}'),
(16, '{}'),
(17, '{}'),
(18, '{}'),
(19, '{}'),
(20, '{}'),
(21, '{}'),
(22, '{}'),
(23, '{}'),
(24, '{}'),
(25, '{}');
END_OF_SCRIPT
