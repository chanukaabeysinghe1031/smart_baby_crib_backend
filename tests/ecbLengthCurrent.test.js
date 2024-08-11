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

describe('ecbLengthCurrent API', () => {
  let createdId

  it('should create a new current length record', async () => {
    let response = await request(app)
    .post('/api/length/historical')
    .send({
      avgMarketAge: 16,
      avgHeightMale: 72,
      avgHeightFemale: 68,
    })
    .set('X-API-TOKEN', process.env.API_TOKEN)

    response = await request(app)
      .post('/api/length/current')
      .send({
        userFedFirstName: "John",
        userFedSex: "M",
        userFedBirthLength: 20,
        userFedAge: 16,
        sysUserId: 6754632,
        sysArduinoLength: 70
      })
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('_id')
    expect(response.body).toHaveProperty('sysAvgExpectedLength', 72)
    createdId = response.body._id
  })

  it('should retrieve all current length records', async () => {
    const start = new Date().toISOString().split('T')[0]
    const end = new Date().toISOString().split('T')[0]

    const response = await request(app)
      .get(`/api/length/current/user/6754632?startDate=${start}&endDate=${end}`)

      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toBeInstanceOf(Array)
  })

  it('should retrieve a single current length record by ID', async () => {
    const response = await request(app)
      .get(`/api/length/current/${createdId}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', createdId)
  })
})
