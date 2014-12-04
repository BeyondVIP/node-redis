module.exports = {
  'development': {
    'port': null,
    'host': null
  },
  'staging': {
    'port': '6379',
    'host': 'bvip-stage-redis-001.adwtly.0001.use1.cache.amazonaws.com'
  },
  'production': {
    'port': '6379',
    'host': 'bvip-redis.adwtly.0001.use1.cache.amazonaws.com'
  }
}
