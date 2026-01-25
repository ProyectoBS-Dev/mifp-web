// ============================================
// 🧪 Test de Conexión Upstash Redis
// ============================================
// Verifica que las credenciales de Upstash funcionen

import { Redis } from '@upstash/redis'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Cargar .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '..', '.env.local') })

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

async function testConnection() {
  console.log('🔍 Testing Upstash Redis connection...\n')
  
  console.log('📋 Config:')
  console.log('  URL:', process.env.UPSTASH_REDIS_REST_URL)
  console.log('  Token:', process.env.UPSTASH_REDIS_REST_TOKEN ? '✅ Present' : '❌ Missing')
  console.log('')

  try {
    // Test 1: PING
    console.log('Test 1: PING')
    const pingResult = await redis.ping()
    console.log('  Result:', pingResult)
    console.log('  ✅ PING successful\n')

    // Test 2: SET/GET
    console.log('Test 2: SET/GET')
    const testKey = 'test:connection:' + Date.now()
    await redis.set(testKey, 'hello-world', { ex: 10 })
    const value = await redis.get(testKey)
    console.log('  Set:', testKey)
    console.log('  Get:', value)
    console.log('  ✅ SET/GET successful\n')

    // Test 3: INCR (usado por rate limiting)
    console.log('Test 3: INCR (rate limiting)')
    const counterKey = 'test:counter:' + Date.now()
    const count1 = await redis.incr(counterKey)
    const count2 = await redis.incr(counterKey)
    const count3 = await redis.incr(counterKey)
    console.log('  Increments:', count1, count2, count3)
    console.log('  ✅ INCR successful\n')

    // Test 4: TTL
    console.log('Test 4: TTL')
    await redis.set('test:ttl', 'value', { ex: 60 })
    const ttl = await redis.ttl('test:ttl')
    console.log('  TTL:', ttl, 'seconds')
    console.log('  ✅ TTL successful\n')

    console.log('✅ All tests passed! Upstash Redis is working correctly.')
    
  } catch (error) {
    console.error('❌ Connection test failed:')
    console.error(error)
    process.exit(1)
  }
}

testConnection()
