OLD_DB="./users.db"
NEW_DB="./prisma/users.db"

sqlite3 "$OLD_DB" "SELECT id, xp FROM User;" | while IFS='|' read -r id xp; do
  # Insert into new DB, present defaults to 0
  sqlite3 "$NEW_DB" "INSERT INTO User (id, xp) VALUES ('$id', $xp);"
done