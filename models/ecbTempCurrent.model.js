import mongoose from 'mongoose'
import ecbTempHistorical from './ecbTempHistorical.model.js'

const ecbTempCurrentSchema = new mongoose.Schema({
  etlDateTime: { type: Date, default: Date.now },
  etlSequenceNo: { type: Number },
  userFedFirstName: { type: String, required: true },
  userFedSex: { type: String, enum: ['M', 'F'], required: true },
  userFedAge: { type: Number, required: true },
  sysUserId: { type: Number, required: true },
  sysArduinoTemperature: { type: Number, required: true },
  sysAvgExpectedTemperature: { type: Number }
}, { timestamps: true })

ecbTempCurrentSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const lastEntry = await this.constructor.findOne({ sysUserId: this.sysUserId }).sort({ etlSequenceNo: -1 })
            if (lastEntry) {
                this.etlSequenceNo = lastEntry.etlSequenceNo + 1
            } else {
                this.etlSequenceNo = 1 // Start from 1 if no previous records are found for this user
            }

            // Fetch the historical data
            const historicalData = await ecbTempHistorical.findOne({ avgMarketAge: this.userFedAge })
            if (historicalData) {
                this.sysAvgExpectedTemperature = historicalData.avgMarketTemperature
            }

            next()
        } catch (err) {
            return next(err)
        }
    } else {
        next()
    }

})

const ecbTempCurrent = mongoose.model('EcbTempCurrent', ecbTempCurrentSchema)

export default ecbTempCurrent
