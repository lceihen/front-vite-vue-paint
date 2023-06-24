MY_VARIABLE="Hello, World!"

sed 's/servername/'"$MY_VARIABLE"'/g' docker-compose.yaml >docker-compose-updated.yaml
