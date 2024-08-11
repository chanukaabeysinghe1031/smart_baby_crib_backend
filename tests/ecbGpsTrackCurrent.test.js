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

describe('ecbGpsTrackCurrent API', () => {
  let createdId

  it('should create a new record', async () => {
    const response = await request(app)
      .post('/api/gps/current')
      .send({
        sysUserId: 675463,
        userFedParent1FirstName: "John",
        userFedParent2FirstName: "Claudia",
        sysGpsLongitude: "8748374, 9792322",
        sysGpsLatitude: "8025374, 9797352",
      })
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('_id')
    createdId = response.body._id
  })

  it('should retrieve all records', async () => {
    const start = new Date().toISOString().split('T')[0]
    const end = new Date().toISOString().split('T')[0]

    const response = await request(app)
      .get(`/api/gps/current/user/675463?startDate=${start}&endDate=${end}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toBeInstanceOf(Array)
  })

  it('should retrieve a single record by ID', async () => {
    const response = await request(app)
      .get(`/api/gps/current/${createdId}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', createdId)
  })

  it('should update a record by ID', async () => {
    const response = await request(app)
      .put(`/api/gps/current/${createdId}`)
      .send({
        sysUserId: 675363,
        userFedParent1FirstName: "John",
        userFedParent2FirstName: "Claudia",
        sysGpsLongitude: "4536875, 9792322",
        sysGpsLatitude: "3845632, 9797352",
      })
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('sysGpsLongitude', "4536875, 9792322")
    expect(response.body).toHaveProperty('sysGpsLatitude', "3845632, 9797352")
  })

  it('should delete a record by ID', async () => {
    const response = await request(app)
      .delete(`/api/gps/current/${createdId}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message', 'Record deleted successfully')
  })
})
