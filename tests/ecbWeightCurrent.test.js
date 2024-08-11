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

describe('ecbWeightCurrent API', () => {
  let createdId

  it('should create a new record', async () => {
    let response = await request(app)
      .post('/api/weight/historical')
      .send({
        avgMarketAge: 30,
        maleTop50PercentileWeight: 145,
        femaleTop50PercentileWeight: 125,
      })
      .set('X-API-TOKEN', process.env.API_TOKEN)

      response = await request(app)
      .post('/api/weight/current')
      .send({
        userFedFirstName: 'Caludia',
        userFedSex: 'F',
        userFedBirthWeight: 10,
        userFedAge: 30,
        sysUserId: 8765484,
        sysArduinoWeight: 120,
      })
      .set('X-API-TOKEN', process.env.API_TOKEN)

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('_id')
    expect(response.body).toHaveProperty('sysAvgExpectedWeight', 125)
    createdId = response.body._id
  })

  it('should retrieve all records', async () => {
    const start = new Date().toISOString().split('T')[0]
    const end = new Date().toISOString().split('T')[0]

    const response = await request(app)
      .get(`/api/weight/current/user/8765484?startDate=${start}&endDate=${end}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)

    expect(response.status).toBe(200)
    expect(response.body).toBeInstanceOf(Array)
  })

  it('should retrieve a single record by ID', async () => {
    const response = await request(app)
      .get(`/api/weight/current/${createdId}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', createdId)
  })

})
