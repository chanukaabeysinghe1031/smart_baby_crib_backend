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

describe('ecbTempCurrent API', () => {
  let createdId

  it('should create a new current temperature record', async () => {
    let response = await request(app)
    .post('/api/temp/historical')
    .send({
      avgMarketAge: 16,
      avgMarketTemperature: 98.7,
    })
    .set('X-API-TOKEN', process.env.API_TOKEN)

    response = await request(app)
      .post('/api/temp/current')
      .send({
        userFedFirstName: 'John',
        userFedSex: 'M',
        userFedAge: 16,
        sysUserId: 45643,
        sysArduinoTemperature: 98.5
      })
      .set('X-API-TOKEN', process.env.API_TOKEN)

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('_id')
    expect(response.body).toHaveProperty('sysAvgExpectedTemperature', 98.7)
    createdId = response.body._id
  })

  it('should retrieve all current temperature records', async () => {
    const start = new Date().toISOString().split('T')[0]
    const end = new Date().toISOString().split('T')[0]

    const response = await request(app)
      .get(`/api/temp/current/user/45643?startDate=${start}&endDate=${end}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)

    expect(response.status).toBe(200)
    expect(response.body).toBeInstanceOf(Array)
  })

  it('should retrieve a single current temperature record by ID', async () => {
    const response = await request(app)
      .get(`/api/temp/current/${createdId}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', createdId)
  })
})
