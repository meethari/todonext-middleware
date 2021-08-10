# adds a task to the given list
curl "$TARGET/api/lists/$1/tasks" -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $JWT"  --data '{"text": "read Harry Potter"}'