const http = require('http');
const States = require ('../model/States');
const fsPromises = require('fs').promises;
const path = require('path');
const express = require('express');
const fs = require('fs');
const app = express();
const mongoose = require('mongoose');


const data = {
  states: require('../model/states.json')
};

const qs = require('qs');

// const getAllStates = async (req, res) => {
//   const query = req.query;
//   let states = data.states;
//   if ('contig' in query) {
//         const isContig = Boolean(query.contig);
//         const filteredStates = data.states.filter(state => {
//           if (isContig) {
//             return state.code !== 'AK' && state.code !== 'HI';
//           } else {
//             return state.code === 'AK' || state.code === 'HI';
//           }
//         });
    
//         res.json(filteredStates);
//       } else {
//         res.json(data.states);
//       }

//   for (const state of states) {
//     const foundState = await States.findOne({ stateCode: state.code }).exec();
//     if (foundState && foundState.funfacts) {
//       state.funfacts = foundState.funfacts;
//     }
//   }

//   res.json(states);
// };


const getAllStates = async (req, res) => {
  // const query = req.query;
  let states = data.states;

  // if ('contig' in query) {
  //   const isContig = Boolean(query.contig);
  //   const filteredStates = states.filter(state => {
  //     if (isContig) {
  //       return state.code !== 'AK' && state.code !== 'HI';
  //     } else {
  //       return state.code === 'AK' || state.code === 'HI';
  //     }
  //   });

  //   states = filteredStates;
  // }

  for (const state of states) {
    const foundState = await States.findOne({ stateCode: state.code }).exec();
    if (foundState && foundState.funfacts) {
      state.funfacts = foundState.funfacts;
    }
  }

  res.json(states);
};




const getState = async (req, res) => {
  // Destructure the request parameters for better readability
  const code = req.params.code.toUpperCase();
  const states = data.states;

  
  // Check if stateCode is provided in the request
  if (!code) {
    return res.status(400).json({ 'message': 'State code is required.' });
  }
  
  // Find the state in the data array based on stateCode
  const state = data.states.find(state => state.code === code);
 
  
  // Check if state is found, and return appropriate response
  if (!state) {
    return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });
  }

  // // Fetch the funfacts from MongoDB collection based on state code
  // const funfacts = await States.find({ stateCode: code });
 

//   if(funfacts){
// // Attach the funfacts to the state object
// state.funfacts = funfacts.map(f => f.funfacts);
//   } 
  for (const state of data.states) {
    const foundState = await States.findOne({ stateCode: state.code }).exec();
    if (foundState && foundState.funfacts) {
      state.funfacts = foundState.funfacts;
    }
  }
  

  // Return the state as JSON response
  res.json(state);
};


const getfunfact = async (req, res) => {

  const code = req.params.stateCode.toUpperCase();
  

  const state = await States.findOne({ stateCode: code }).exec();
  const name = data.states.find(state => state.code === code);
  
  
  
  
  
  
  // Check if state is found, and return appropriate response
  if (!name) {
    return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });
  }

  if (!state) {
    // handle case where state with given stateCode was not found
    return res.status(404).json({ 'message': `No Fun Facts found for ${name.state}` });
  }

  const funfactIndex = Math.floor(Math.random() * state.funfacts.length);
  // if (funfactIndex === -1) {
  //   // handle case where state does not have a funfact that includes the stateCode
  //   return res.status(404).json({ 'message': `No funfacts found for ${name.state}` });
  //   // return res.status(404).json({ 'message': 'Invalid state abbreviation parameter' });
  // }
 
  const funfact = state.funfacts[funfactIndex];
  res.json({ funfact });
  
}

const postfunfact = async (req, res) => {
  const code = req.params.stateCode.toUpperCase();
  const funfacts = req.body.funfacts;

  if(!funfacts) {
    return res.json({ 'message': 'State fun facts value required' });
  }

  if(!Array.isArray(funfacts)) {
    return res.status(400).json({ message: 'State fun facts value must be an array' });
  }

  try {
    // Find the requested state in the database
    let state = await States.findOne({ stateCode: code }).exec();

    // If the state is not found, create a new record in the database
    if(!state) {
      state = new States({ stateCode: code, funfacts });
      await state.save();
    } 
    // If the state is found, update its funfacts array with the new funfacts
    else {
      if(!state.funfacts || state.funfacts.length === 0) {
        state.funfacts = funfacts;
      } else {
        state.funfacts.push(...funfacts);
      }
      await state.save();
    }

    // Retrieve the updated state from the database
    state = await States.findOne({ stateCode: code }).exec();

    res.status(201).json({ stateCode: state.stateCode, funfacts: state.funfacts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const patchfunfact = async (req, res) => {
  const code = req.params.stateCode.toUpperCase();
  const name = data.states.find(state => state.code === code);

  
  const funfacts = req.body.funfacts;

  const { index, funfact } = req.body;

  // Check if index and funfact are provided
  if (!funfact) {
    return res.status(400).json({ 'message': 'State fun fact value required' });
  }
  if(!index){
    return res.status(400).json({'message': 'State fun fact index value required'});
  }

  // Find the state by state code
  const foundState = await States.findOne({ stateCode: code }).exec();
  if (!foundState) {
    return res.status(404).json({ message: `No Fun Facts found for ${name.state}` });
  }

  // Check if the index is valid
  if (index < 1 || index > foundState.funfacts.length) {
    return res.status(400).json({ 'message': `No Fun Fact found at that index for ${name.state}` });
  }

  // Update the fun fact at the specified index
  foundState.funfacts[index - 1] = funfact;

  // Save the updated record
  const updatedState = await foundState.save();

  // res.status(200).json(updatedState);
  res.status(201).json({ stateCode: foundState.stateCode, funfacts: foundState.funfacts });
};

const deletefunfact = async (req, res) => {

  const code = req.params.stateCode.toUpperCase();
  const name = data.states.find(state => state.code === code);


  const { index } = req.body;

  // Check if index and funfact are provided
  if (!index) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }

  // Find the state by state code
  const foundState = await States.findOne({ stateCode: code }).exec();
  if (!foundState) {
    return res.status(404).json({ message: `No Fun Facts found for ${name.state}` });
  }

  // Check if the index is valid
  if (index < 1 || index > foundState.funfacts.length) {
    return res.status(400).json({ message: `No Fun Facts found for ${name.state}` });
  }

   // Remove the fun fact at the specified index
  foundState.funfacts = foundState.funfacts.filter((_, i) => i !== index - 1);

  // Save the updated record
  const updatedState = await foundState.save();

  res.status(200).json(updatedState);
  
};


// const contigStates = (req, res) => {
//   console.log('hello');
//   const query = qs.parse(req.query);

//   if ('contig' in query) {
//     const isContig = Boolean(query.contig);
//     const filteredStates = data.states.filter(state => {
//       if (isContig) {
//         return state.code !== 'AK' && state.code !== 'HI';
//       } else {
//         return state.code === 'AK' || state.code === 'HI';
//       }
//     });

//     res.json(filteredStates);
//   } else {
//     res.json(data.states);
//   }
// };
  


const getCapital = async (req, res) => {
  // Destructure the request parameters for better readability
  const { code } = req.params;
  
  // Check if stateCode is provided in the request
  if (!code) {
    return res.status(400).json({ 'message': 'State code is required.' });
  }
  
  try {
    // Find the state in the data array based on stateCode
    const state = data.states.find(state => state.code === code.toUpperCase());
    
    if (!state) {
      return res.status(400).json({ 'message': 'Invalid state abbreviation parameter'});
    }
    
    // Retrieve fun facts for the state from MongoDB
    const facts = await States.findOne({ code: code });
    
    // Return the state and capital city, and fun facts as JSON response
    res.json({ 'state': state.state, 'capital': state.capital_city });
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 'message': 'Internal server error.' });
  }
};


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
  return res.status(400).json({ 'message': `Invalid state abbreviation parameter`});
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
  res.json({'state': state.state, 'population': `${population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`});
} else {
  return res.status(400).json({ 'message': 'Invalid state abbreviation parameter'});
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
  return res.status(400).json({ 'message': `Invalid state abbreviation parameter`});
}
  
}
  
  



// const deleteState = async (req, res) => {
//     // if (!req?.body?.id) return res.status(400).json({ 'message': 'State ID required.'});

//     // const state = await States.findOne({ _id: req.body.id }).exec();
//     // if (!state) {
//     //     return res.status(204).json({ "message": `No employee matches ID ${req.body.id}.` });
//     // }
//     // const result = await state.deleteOne({ _id: req.body.id });
//     // res.json(result);
// }


module.exports = {
    getAllStates,
    getCapital,
    getPopulation,
    getNickname,
    getAdmission,
    getfunfact,
    postfunfact,
    patchfunfact,
    deletefunfact,
    // contigStates,
    // createNewState,
    // updateState,
    // deleteState,
    getState
}