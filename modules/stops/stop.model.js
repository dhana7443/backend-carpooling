const mongoose = require('mongoose');
const { Schema } = mongoose;

const stopSchema = new Schema({
  stop_name: {
    type: String,
    required: true,
    trim: true
  },
  stop_type: {
    type: String,
    enum: ['origin', 'destination', 'intermediate'],
    required: true
  },
  route_id: {
    type: String,
    required: true
  },
  stop_order: {
    type: Number,
    required: true
  },
},
{
    timestamps: true, // adds createdAt and updatedAt automatically
}
);

module.exports = mongoose.model('Stop', stopSchema);
