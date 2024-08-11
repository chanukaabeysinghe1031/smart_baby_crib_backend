import request from 'supertest'
import app from '../app'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

beforeAll(async () => {
  await mongoose.connect(process.env.DB_URL)
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('ecbWeightHistorical API', () => {
  let createdId

  it('should create a new historical weight record', async () => {
    const response = await request(app)
      .post('/api/weight/historical')
      .send({
        avgMarketAge: 43,
        maleTop50PercentileWeight: 145,
        femaleTop50PercentileWeight: 125,
      })
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('_id')
    createdId = response.body._id
  })

  it('should retrieve all historical weight records', async () => {
    const response = await request(app)
      .get('/api/weight/historical')
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toBeInstanceOf(Array)
  })

  it('should retrieve a single historical weight record by ID', async () => {
    const response = await request(app)
      .get(`/api/weight/historical/${createdId}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', createdId)
  })

  it('should update a historical weight record by ID', async () => {
    const response = await request(app)
      .put(`/api/weight/historical/${createdId}`)
      .send({ avgMarketAge: 43,
        maleTop50PercentileWeight: 130,
        femaleTop50PercentileWeight: 120
       })
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('maleTop50PercentileWeight', 130)
  })

  it('should delete a historical weight record by ID', async () => {
    const response = await request(app)
      .delete(`/api/weight/historical/${createdId}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message', 'Record deleted successfully')
  })
})
