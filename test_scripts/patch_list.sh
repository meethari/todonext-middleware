# updates the listName of the given list
curl localhost:5000/api/lists/60f1b9d9072dc32933fd4c26 --cookie jarfile -X PATCH -H "Content-Type: application/json" --data '{"listName": "startup"}'