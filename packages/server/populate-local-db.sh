#! /bin/bash
set -a; source .env; set +a
psql -h $LOCAL_IP -p 5432 -d test_db -U root << END_OF_SCRIPT
TRUNCATE "CategoryDataContents", "CategoryDataBase" restart identity;

INSERT INTO "CategoryDataBase" ("rataextraRequestPage", "alfrescoFolder", "writeRights")
VALUES ('/linjakaaviot', '/123', 'Rataextra_kirjoitus_linjakaaviot');

INSERT INTO "CategoryDataContents" ("baseId", "fields")
VALUES (1, '{"test": "test"}')
END_OF_SCRIPT
