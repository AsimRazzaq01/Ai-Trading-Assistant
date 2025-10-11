--db/init.sql
-- Simple bootstrap (SQLAlchemy will manage schema too). This ensures DB exists.
-- You can leave this empty or add seed data if desired.


-- Docker handles init.sql automatically via this line in your docker-compose.yml:
-- ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
-- So the file does not need IntelliJ to execute it.
