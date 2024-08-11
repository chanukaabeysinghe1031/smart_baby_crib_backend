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

describe('ecbLengthHistorical API', () => {
  let createdId

  it('should create a new historical length record', async () => {
    const response = await request(app)
      .post('/api/length/historical')
      .send({
        avgMarketAge: 7,
        avgHeightMale: 72,
        avgHeightFemale: 68,
      })
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('_id')
    createdId = response.body._id
  })

  it('should retrieve all historical length records', async () => {
    const response = await request(app)
      .get('/api/length/historical')
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toBeInstanceOf(Array)
  })

  it('should retrieve a single historical length record by ID', async () => {
    const response = await request(app)
      .get(`/api/length/historical/${createdId}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', createdId)
  })

  it('should update a historical length record by ID', async () => {
    const response = await request(app)
      .put(`/api/length/historical/${createdId}`)
      .send({
        avgMarketAge: 7,
        avgHeightMale: 68,
        avgHeightFemale: 66,
      })
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('avgHeightFemale', 66)
  })

  it('should delete a historical length record by ID', async () => {
    const response = await request(app)
      .delete(`/api/length/historical/${createdId}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message', 'Record deleted successfully')
  })
})
