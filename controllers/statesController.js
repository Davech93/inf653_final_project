const http = require('http');

const States = require ('../model/States');
const statesData = require ('../model/states.json');
const fsPromises = require('fs').promises;
const path = require('path');

const express = require('express');
const fs = require('fs');
const app = express();

// Start the Express app
app.listen(3000, () => {
  console.log('App started on http://localhost:3500');
});


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

  const getAllStates = (req, res) => {
    let states = statesData;
    
    if (req.query.contig === 'true') {
      states = states.filter(state => state.code !== 'AK' && state.code !== 'HI');
    } else if (req.query.contig === 'false') {
      states = states.filter(state => state.code === 'AK' || state.code === 'HI');
    }
    
    res.json(states);
  };


  const getState = async (req, res) => {
    // if (!req?.params?.code) return res.status(400).json({ 'message': 'State ID required.'});
    
    // const state = await States.findOne({ code: req.params.code }).exec();
    // if (!state) {
    //     return res.status(204).json({ "message": `No state matches ID ${req.params.code}.` });
    // }
    // const searchParam = req.query.search;
    // const state = await statesData.filter(state => state.code === searchParam); // Assumes the JSON file contains an array of objects with 'name' property

    // res.json(state);
}

app.get('/states/:state', (req, res) => {
  // Read and parse the JSON file
  fs.readFile(path.join(__dirname, 'model', 'states.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    const jsonData = JSON.parse(data);

    // Access the URL parameter using req.params
    const searchParam = req.params.state; // Assumes the parameter is named 'state'

    // Search for data in the JSON object
    const searchResult = jsonData.filter(item => item.code === searchParam);

    // Send the search result as the response
    res.json(searchResult);
  });
});
  //contiguous 48 states

  //non-contiguous HI & AK
  

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
    
 

// const getAllStates = async (req, res) => {
//     const states = await states.find();
//     if (!states) return res.status(204).json({ 'message': 'No states found.' });
//     res.json(states);
// }

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


module.exports = {
    getAllStates,
    createNewState,
    updateState,
    deleteState,
    getState
}