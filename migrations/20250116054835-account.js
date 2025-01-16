module.exports = {
  async up(db) {
    
    await db.collection('useraccounts').updateMany(
      {},
      {
        $set: {
          isVerifier: true,
        },
      }
    );
  },

  async down(db) {
   
    await db.collection('useraccounts').updateMany(
      {},
      {
        $unset: {
          isVerifier: "",
        },
      }
    );
  }
};
module.exports = {
  async up(db) {
    
    await db.collection('products').updateMany(
      { stock: 0 },
      {
        $set: {
          stock: 10,
        },
      }
    );
  },

  async down(db) {
    
    await db.collection('products').updateMany(
      {},
      {
        $set: {
          stock: 0,
        },
      }
    );
  }
};
