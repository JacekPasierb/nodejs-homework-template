const User = require("../models/user.model");

const findUser = async (query) => {
   
    try {
        return await User.findOne(query);
    } catch (error) {
        console.error(error.message);
    }
}
const findUserByNameOrEmail = async (query) => {    
  try {
    return await User.findOne({ $or: query });
  } catch (error) {
    
    console.error(error.message);
  }
};

const createUser = async(body) => {
    try {
        return new User(body);
        
    } catch (err) {
      console.error(err.message);
      throw new Error(err);
    }
}
const updateUser = async (query, update) => {
    try {
        return User.findByIdAndUpdate(query,update, { new: true });
    } catch (error) {
          console.error(error.message);
    }
}

module.exports = {
    findUser,
    findUserByNameOrEmail,
    createUser,
    updateUser,
}