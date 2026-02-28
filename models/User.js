const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['staff', 'admin'],
        default: 'staff'
    }
}, { timestamps: true }); // adds createdAt & updatedAt automatically

// Hash password BEFORE saving to DB
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return; // only hash if password changed
    this.password = await bcrypt.hash(this.password, 12);
});

// Method to compare passwords at login
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);