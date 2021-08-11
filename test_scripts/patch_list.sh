# updates the listName of the given list
curl "$TARGET/api/lists/$1" -X PATCH -H "Content-Type: application/json" -H "Authorization: Bearer $JWT"  --data '{"listName": "amazing list"}'