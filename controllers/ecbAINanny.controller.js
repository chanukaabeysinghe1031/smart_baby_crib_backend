import ecbAiNanny from "../models/ecbAINanny.model.js";
import axios from "axios"; // Add this line

// Retrieve all records
export const findAllByUser = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.params.id;
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    const query = {
      etlDateTime: {
        $gte: start,
        $lte: end,
      },
      sysUserId: userId,
    };

    const data = await ecbAiNanny.find(query);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new record
export const create = async (req, res) => {
  const data = new ecbAiNanny(req.body);
  try {
    const newData = await data.save();
    res.status(201).json(newData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a record by user id
export const update = async (req, res) => {
  try {
    const { sysUserId, etlSequenceNo } = req.body;
    const updatedData = await ecbAiNanny.findOneAndUpdate(
      { sysUserId: sysUserId, etlSequenceNo: etlSequenceNo },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedData) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.status(200).json(updatedData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a record by sysUserId and etlSequenceNo
export const deleteRecord = async (req, res) => {
  try {
    const { sysUserId, etlSequenceNo } = req.body;
    const deletedData = await ecbAiNanny.findOneAndDelete({
      sysUserId: sysUserId,
      etlSequenceNo: etlSequenceNo,
    });
    if (!deletedData) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addNewQuestion = async (req, res) => {
  const { sysUserId, question } = req.body;

  // Validate input
  if (!sysUserId || !question) {
    return res
      .status(400)
      .json({ message: "userId and question are required" });
  }

  try {
    // Make a request to the external API
    const response = await axios.post(
      "https://smartbabyai2-dfgfeeevb6f6e2c6.eastus-01.azurewebsites.net/ask",
      {
        sysUserId,
        question,
      }
    );

    // Extract the response data
    const sysResponse = response.data.response;

    // Create a new record in MongoDB
    const newRecord = new ecbAiNanny({
      sysUserId: sysUserId,
      userFedQuestion: question,
      sysResponse: sysResponse,
    });

    const savedRecord = await newRecord.save();

    // Return the saved record
    res.status(201).json(savedRecord);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
