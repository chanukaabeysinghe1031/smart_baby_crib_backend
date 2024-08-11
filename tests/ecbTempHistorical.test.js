import request from 'supertest'
import app from '../app'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

beforeAll(async () => {
  await mongoose.connect("mongodb+srv://admin:admin@cluster0.yk4m9vr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('ecbTempHistorical API', () => {
  let createdId

  it('should create a new historical temperature record', async () => {
    const response = await request(app)
      .post('/api/temp/historical')
      .send({
        avgMarketAge: 7,
        avgMarketTemperature: 98.7,
      })
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('_id')
    createdId = response.body._id
  })

  it('should retrieve all historical temperature records', async () => {
    const response = await request(app)
      .get('/api/temp/historical')
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toBeInstanceOf(Array)
  })

  it('should retrieve a single historical temperature record by ID', async () => {
    const response = await request(app)
      .get(`/api/temp/historical/${createdId}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', createdId)
  })

  it('should update a historical temperature record by ID', async () => {
    const response = await request(app)
      .put(`/api/temp/historical/${createdId}`)
      .send({
        avgMarketAge: 7,
        avgMarketTemperature: 98.3,
      })
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('avgMarketTemperature', 98.3)
  })

  it('should delete a historical temperature record by ID', async () => {
    const response = await request(app)
      .delete(`/api/temp/historical/${createdId}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message', 'Record deleted successfully')
  })
})
