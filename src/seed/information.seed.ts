import mongoose from 'mongoose';
import { PersonalInformationSchema } from '../customer/schemas/customer.schema';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedPersonalInformation() {
    if (!process.env.DATABASE_URL) {
        console.error('Error: DATABASE_URL is not defined in the environment variables.');
        process.exit(1);
    }

    await mongoose.connect(process.env.DATABASE_URL, {});
    const PersonalInformationModel = mongoose.model('PersonalInformation', PersonalInformationSchema);

    console.log('Deleting existing data in the "personal_information" collection...');
    await PersonalInformationModel.deleteMany({});

    console.log('Adding new seed data to the "personal_information" collection...');
    const data = [
        {
            id: 1,
            userId: new mongoose.Types.ObjectId(),
            fullName: 'John Doe',
            phoneNumber: '123-456-7890',
            dateOfBirth: new Date('1990-01-01'),
            addressLine: '123 Main St, Cityville',
        },
        {
            id: 2,
            userId: new mongoose.Types.ObjectId(),
            fullName: 'Jane Smith',
            phoneNumber: '987-654-3210',
            dateOfBirth: new Date('1985-05-15'),
            addressLine: '456 Elm St, Townsville',
        },
    ];

    await PersonalInformationModel.insertMany(data);
    console.log('Personal information seeding completed successfully.');
    await mongoose.disconnect();
}

seedPersonalInformation()
    .then(() => {
        console.log('Database seeding process for personal information finished.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error during database seeding:', error);
        process.exit(1);
    });
