const mongoose = require('mongoose');

const checkObjectId = (objectId) => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[objectId]))
    return res.status(400).json([{ msg: 'Invalid ID' }]);
  next();
};

module.exports = checkObjectId;