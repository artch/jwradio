var data = require('./db.json');
const mongo = require('./mongo');

setTimeout(() => {

    // data.history.reduce((promise, i) => promise.then(() => {
    //     console.log(i);
    //     return mongo.db.collection('generations').insert({
    //         user: mongo.ObjectId('5c7646354640cc0fd07f5abb'),
    //         count: +i.count,
    //         duration: +i.duration,
    //         name: i.description,
    //         batch: i.batch,
    //         date: new Date(i.date),
    //     })
    // }), Promise.resolve())
    //     .then(() => process.exit());

    data.codes.reduce((promise, i) => promise.then(() => {
        console.log(i);
        return mongo.db.collection('generations').findOne({batch: i.batch})
            .then(generation => {
                if(!generation) {
                    console.error('no generation',i.batch);
                    return;
                }
                return mongo.db.collection('codes').insert({
                    generation: generation._id,
                    code: i.code,
                    activated: i.activated ? new Date(i.activated) : undefined,
                    IP: i.IP
                });
            });
    }), Promise.resolve())
        .then(() => process.exit());




}, 2000);


