# adds a task to the given list
curl localhost:5000/api/lists/60f0db9d70d9dc028502d616/tasks --cookie jarfile -X POST -H "Content-Type: application/json" --data '{"text": "do cs150 homework"}'