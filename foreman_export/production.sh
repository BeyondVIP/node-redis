echo "NODE_ENVIRONMENT=production" > .env
mkdir -p log/
nf export  -o /etc/init/ -a node-redis -l `pwd`/log/ -p 8814 web=4
nf export  -o /etc/init/ -a node-redis-keeper -l `pwd`/log/