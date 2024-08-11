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

describe('ecbFingerPrintCurrent API', () => {
  let createdId

  it('should create a new record', async () => {
    const response = await request(app)
      .post('/api/fingerprint/current')
      .send({
        sysUserId: 998735,
        userFedParent1FirstName: "Jon",
        userFedParent2FirstName: "Martha",
        sysBiometricTemplate1: Buffer.from('template1_data'),
        sysBiometricTemplate2: Buffer.from('template2_data'),
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
      .get(`/api/fingerprint/current/user/998735?startDate=${start}&endDate=${end}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toBeInstanceOf(Array)
  })

  it('should retrieve a single record by ID', async () => {
    const response = await request(app)
      .get(`/api/fingerprint/current/${createdId}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', createdId)
  })

  it('should update a record by ID', async () => {
    const response = await request(app)
      .put(`/api/fingerprint/current/${createdId}`)
      .send({
        sysUserId: 998735,
        userFedParent1FirstName: "Jon",
        userFedParent2FirstName: "Caludia",
        sysBiometricTemplate1: Buffer.from('template1_data'), 
        sysBiometricTemplate2: Buffer.from('template3_data'),
      })
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('userFedParent2FirstName', 'Caludia')
  })

  it('should delete a record by ID', async () => {
    const response = await request(app)
      .delete(`/api/fingerprint/current/${createdId}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message', 'Record deleted successfully')
  })
})
