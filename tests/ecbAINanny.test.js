import request from 'supertest'
import app from '../app'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

beforeAll(async () => {
  await mongoose.connect("mongodb+srv://admin:admin@cluster0.yk4m9vr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true })
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('ecbAINanny API', () => {
  let createdId

  it('should create a new record', async () => {
    const response = await request(app)
      .post('/api/ainanny')
      .send({ sysUserId: 887342,
              userFedQuestion: 'A very complex question.',
              sysResponse: 'A very simple response',
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
      .get(`/api/ainanny/user/887342?startDate=${start}&endDate=${end}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)
    
    expect(response.status).toBe(200)
    expect(response.body).toBeInstanceOf(Array)
  })

  it('should retrieve a single record by ID', async () => {
    const response = await request(app)
      .get(`/api/ainanny/${createdId}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', createdId)
  })

  it('should update a record by ID', async () => {
    const response = await request(app)
      .put(`/api/ainanny/${createdId}`)
      .send({ sysUserId: 887342,
              userFedQuestion: 'Another very complex question.',
              sysResponse: 'Another simple response',
            })
      .set('X-API-TOKEN', process.env.API_TOKEN)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('userFedQuestion', 'Another very complex question.')
  })

  it('should delete a record by ID', async () => {
    const response = await request(app)
      .delete(`/api/ainanny/${createdId}`)
      .set('X-API-TOKEN', process.env.API_TOKEN)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message', 'Record deleted successfully')
  })
})
