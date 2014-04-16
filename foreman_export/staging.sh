echo "NODE_ENVIRONMENT=staging" > .env
mkdir -p log/
nf export -o /etc/init/ -a node-redis -l `pwd`/log/ -p 8814