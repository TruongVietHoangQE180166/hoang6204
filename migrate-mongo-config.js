require('dotenv').config();  
module.exports = {
  mongodb: {
    url: process.env.DATABASE_URL, 
    databaseName: 'store-management', 
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  migrationsDir: 'migrations', 
  changelogCollectionName: 'changelog', 
  migrationFileExtension: '.js', 
};
