#! /bin/bash
set -a; source .env; set +a
psql -h $LOCAL_IP -p $DB_PORT -d $DATABASE_NAME -U $DATABASE_USER << END_OF_SCRIPT
TRUNCATE "CategoryDataContents", "CategoryDataBase" restart identity;

INSERT INTO "CategoryDataBase" ("rataextraRequestPage", "alfrescoFolder", "writeRights")
VALUES ('hallintaraportit', '6a1200cb-5fc9-4364-b9bb-645c64c9e31e', 'Ratatieto_kirjoitus_hallintaraportit'),
      ('liikennepaikkojen-yhteystiedot', '6e49cab2-b923-420c-99cc-5926cb0a6375', 'Ratatieto_kirjoitus_liikennepaikkojen_yhteystiedot');

INSERT INTO "CategoryDataContents" ("baseId", "fields")
VALUES (1, '{"test": "test"}')
END_OF_SCRIPT
