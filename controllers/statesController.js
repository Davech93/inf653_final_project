const http = require('http');
const States = require ('../model/States');
const fsPromises = require('fs').promises;
const path = require('path');
const express = require('express');
const fs = require('fs');
const app = express();

const data = {
  states: require('../model/states.json')
};

// Start the Express app
app.listen(3000, () => {
  console.log('App started on http://localhost:3500');
});

// Add the built-in query parser middleware
// app.use(express.urlencoded({ extended: true }));

  // const statesCollection = States.collection('StatesDB'); // Replace 'states' with your collection name

  // Use map() method to create an array of state abbreviation codes
//   const stateAbbreviations = stateData.map(state => state.stateCode);

//   // Insert the state abbreviation codes into MongoDB
//   statesCollection.insertOne({ stateCode: stateCode }, (err, result) => {
//     if (err) throw err;

//     console.log('State abbreviation codes inserted successfully');
  
// });


// Define a route handler for HTTP GET request


  const getAllStates = (req, res) => {
 res.json(data);
  };

  // const contigStates = (req, res) => {
  //   if ('contig' in req.query && (req.query.contig === 'true' || req.query.contig === 'false')) {
  //     let result;
  //     // Returns contiguous states from data.states
  //     if (req.query.contig === 'true') {
  //       result = data.states.filter(state => state.code !== 'AK' && state.code !== 'HI');
  //     }
  //     // Returns non-contiguous states from data.states
  //     else if (req.query.contig === 'false') {
  //       result = data.states.filter(state => state.code === 'AK' || state.code === 'HI');
  //     }
  //     res.json(result);
  //   } else {
  //     // Handle case when 'contig' query parameter is missing or has invalid value
  //     res.status(400).json({ error: 'Invalid or missing contig parameter' });
  //   }
  // }

  const contigStates = (req, res) => {
    // if (!req.query.contig) {
    //   // Return error response if 'contig' is missing
    //   return res.status(400).json({ error: 'Missing contig parameter' });
    // }
    if ('contig' in req.query) {
      if (req.query.contig === true) {
        const contiguousStates = [];
        data.states.forEach(state => {
          if (state.code !== 'AK' && state.code !== 'HI') {
            contiguousStates.push(state);
          }
        });
        res.json(contiguousStates);
      } else if (req.query.contig === false) {
        const nonContiguousStates = [];
        data.states.forEach(state => {
          if (state.code === 'AK' || state.code === 'HI') {
            nonContiguousStates.push(state);
          }
        });
        res.json(nonContiguousStates);
      } else {
        // Handle case when 'contig' query parameter has invalid value
        res.status(400).json({ error: 'Invalid value for contig parameter' });
      }
    } else {
      // Handle case when 'contig' query parameter is missing
      res.status(400).json({ error: 'Missing contig parameter' });
    }
  };



const getState = (req, res) => {
  // Destructure the request parameters for better readability
  const { code } = req.params;
  
  // Check if stateCode is provided in the request
  if (!code) {
    return res.status(400).json({ 'message': 'State code is required.' });
  }
  
  // Find the state in the data array based on stateCode
  const state = data.states.find(state => state.code === code.toUpperCase());
  
  // Check if state is found, and return appropriate response
  if (!state) {
    return res.status(400).json({ 'message': `State code ${code} not found.` });
  }
  
  // Return the state as JSON response
  res.json(state);
};

const getCapital = (req, res) => {
  // Destructure the request parameters for better readability
  const { code } = req.params;
  
  // Check if stateCode is provided in the request
  if (!code) {
    return res.status(400).json({ 'message': 'State code is required.' });
  }
  
  // Find the state in the data array based on stateCode
  const state = data.states.find(state => state.code === code.toUpperCase());
if (state) {
  const capitalCity = state.capital_city; // Access the capital city property of the state object
  res.json({'state': state.state, 'capital': `${capitalCity}`});
} else {
  return res.status(400).json({ 'message': `State with code ${code} not found.`});
}
  
}

const getNickname = (req, res) => {
  // Destructure the request parameters for better readability
  const { code } = req.params;
  
  // Check if stateCode is provided in the request
  if (!code) {
    return res.status(400).json({ 'message': 'State code is required.' });
  }
  
  // Find the state in the data array based on stateCode
  const state = data.states.find(state => state.code === code.toUpperCase());
if (state) {
  const nickname = state.nickname; // Access the capital city property of the state object
  res.json({'state': state.state, 'nickname': `${nickname}`});
} else {
  return res.status(400).json({ 'message': `State with code ${code} not found.`});
}
  
}
const getPopulation = (req, res) => {
  // Destructure the request parameters for better readability
  const { code } = req.params;
  
  // Check if stateCode is provided in the request
  if (!code) {
    return res.status(400).json({ 'message': 'State code is required.' });
  }
  
  // Find the state in the data array based on stateCode
  const state = data.states.find(state => state.code === code.toUpperCase());
if (state) {
  const population = state.population; // Access the capital city property of the state object
  res.json({'state': state.state, 'population': parseInt(`${population}`)});
} else {
  return res.status(400).json({ 'message': `State with code ${code} not found.`});
}
  
}
const getAdmission = (req, res) => {
  // Destructure the request parameters for better readability
  const { code } = req.params;
  
  // Check if stateCode is provided in the request
  if (!code) {
    return res.status(400).json({ 'message': 'State code is required.' });
  }
  
  // Find the state in the data array based on stateCode
  const state = data.states.find(state => state.code === code.toUpperCase());
if (state) {
  const admission = state.admission_date; // Access the capital city property of the state object
  res.json({'state': state.state, 'admitted': `${admission}`});
} else {
  return res.status(400).json({ 'message': `State with code ${code} not found.`});
}
  
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


module.exports = {
    getAllStates,
    getCapital,
    getPopulation,
    getNickname,
    getAdmission,
    contigStates,
    createNewState,
    updateState,
    deleteState,
    getState
}