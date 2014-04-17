echo "NODE_ENVIRONMENT=production" > .env
mkdir -p log/
nf export web=4 keeper=1 -o /etc/init/ -a node-redis -l `pwd`/log/ -p 8814 