DROP TABLE IF EXISTS PUBLIC.updates;

-- UPDATES
  -- TABLE
    CREATE TABLE PUBLIC.updates (
      version TEXT NOT NULL PRIMARY KEY,
      release_notes TEXT NOT NULL
    );
  -- END TABLE
-- END UPDATES
