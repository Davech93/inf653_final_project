const States = require ('../model/States');
const fsPromises = require('fs').promises;
const path = require('path');

const express = require('express');
const fs = require('fs');
const app = express();


// Define a route handler for HTTP GET request
app.get('/states/', (req, res) => {
    // Read the JSON data from file
    fs.readFile(path.join(__dirname, 'model', 'states.json'), 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
        return;
      }
      try {
        // Parse the JSON data
        const jsonData = JSON.parse(data);
        // Send the JSON data as response
        res.json(jsonData);
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });
  });

  //contiguous 48 states

  //non-contiguous HI & AK
  
  // Start the Express app
  app.listen(3000, () => {
    console.log('App started on http://localhost:3500');
  });

// const fileOps = async () => {
//     try {
//         const data = await fsPromises.readFile(path.join(__dirname, 'model', 'states.js'), 'utf8');
//         console.log(data);
//         await fsPromises.writeFile()
//     } catch (err) {
//         console.error(err);
//     }
// }
  
// fileOps();
    
 

const getAllStates = async (req, res) => {
    const states = await states.find();
    if (!states) return res.status(204).json({ 'message': 'No states found.' });
    res.json(states);
}

const createNewState = async (req, res) => {
   if (!req?.body?.state){
    return res.status(400).json({ 'message': 'State name is required'});
   }

   try {
    const result = await States.create({
        state: req.body.state
    });

    res.status(201).json(result);
   } catch (err){
    console.error(err);
   }
}

const updateState = async (req, res) => {
    if (!req?.body?.id){
        return res.status(400).json({ 'message': 'ID parameter is required'});
    }

    const state = await States.findOne({ _id: req.body.id }).exec();
    if (!state) {
        return res.status(204).json({ "message": `No state matches ID ${req.body.id}.` });
    }
    if (req.body?.state) state.firstname = req.body.state;
    const result = await state.save();
    res.json(result);
}

const deleteState = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'State ID required.'});

    const state = await States.findOne({ _id: req.body.id }).exec();
    if (!state) {
        return res.status(204).json({ "message": `No employee matches ID ${req.body.id}.` });
    }
    const result = await state.deleteOne({ _id: req.body.id });
    res.json(result);
}

const getState = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'State ID required.'});
    
    const state = await States.findOne({ _id: req.params.id }).exec();
    if (!state) {
        return res.status(204).json({ "message": `No state matches ID ${req.params.id}.` });
    }
    res.json(state);
}

module.exports = {
    getAllStates,
    createNewState,
    updateState,
    deleteState,
    getState
}