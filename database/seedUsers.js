const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kcheck');

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Create seed users
        const users = [
            {
                name: 'Admin User',
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            },
            {
                name: 'John Staff',
                username: 'johnstaff',
                password: 'staff123',
                role: 'staff'
            },
            {
                name: 'Jane Teacher',
                username: 'janeteacher',
                password: 'teacher123',
                role: 'staff'
            },
            {
                name: 'Mike Instructor',
                username: 'mikeinstructor',
                password: 'instructor123',
                role: 'staff'
            }
        ];

        // Insert users
        const createdUsers = await User.create(users);
        console.log('Created users:');
        createdUsers.forEach(user => {
            console.log(`- ${user.name} (${user.username}) - ${user.role}`);
        });

        console.log('\nSeeding completed successfully!');
        console.log('Login credentials:');
        console.log('Admin: username=admin, password=admin123');
        console.log('Staff: username=johnstaff, password=staff123');

    } catch (error) {
        console.error('Error seeding users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed');
    }
};

// Run seeder if called directly
if (require.main === module) {
    seedUsers();
}

module.exports = seedUsers;
