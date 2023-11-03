const DbConnection = require("../config/database");

const find = async (collection) => {
   const Database = DbConnection.getDb()
   const coll = Database.collection(collection)
   const data = await coll.find({}).toArray()
   return data
}

const findQuery = async (collection,query) => {
    const Database = DbConnection.getDb()
    const coll = Database.collection(collection)
    const data = await coll.find(query).toArray()
    return data
}

const insertMany=async (collection,data) => {
    const Database = DbConnection.getDb()
    const coll = Database.collection(collection)
    const insert_details = await coll.insertMany(data)
    return insert_details
}

const insertOne = async (collection,data) =>{
    const Database = DbConnection.getDb()
    const coll = Database.collection(collection)
    const insert_details = await coll.insertOne(data)
    return insert_details
}

const updateOne = async (collection, data,item) => {
  //todos
    const Database = DbConnection.getDb();
    const coll = Database.collection(collection);
    const update = await coll.updateOne(item, {
      $set: data,
      $currentDate: { updatedAt: true },
    });
  console.log(update);
    return update;
};

const updateMany = async (collection, data,item) => {
  //todos
  const Database = DbConnection.getDb();
  const coll = Database.collection(collection);
  const update = await coll.updateMany(item, {
    $set:  data,
    $currentDate: { updatedAt: true }
  });
  return update;
};

const deleteOne = async (collection, data,item) => {
  const Database = DbConnection.getDb();
  const coll = Database.collection(collection);
  const deleteOne = await coll.deleteOne(item, {
    $set: data,
    $currentDate: { updatedAt: true },
  });
  return deleteOne;
};

// To delete multiple documents, use db. collection. deleteMany() 
// To delete a single document, use db. collection. deleteOne()



module.exports = {
  find,
  findQuery,
  insertMany,
  insertOne,
  updateOne,
  updateMany,
  deleteOne,
};
