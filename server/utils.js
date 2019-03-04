module.exports.jsonResponse = function jsonResponse(fn) {
    return function(request, response, next) {
        Promise.resolve()
            .then(function() {
                return fn(request, response);
            })
            .then(function(data) {
                response.json(Object.assign({ok: 1}, data));
                next();
            })
            .catch(function(error) {
                response.json({error: "" + error});
                if(error.stack) {
                    console.error(error.stack);
                }
                next();
            });
    }
};

module.exports.needAuth = function (request, response, next) {
    if(!request.isAuthenticated()) {
        response.status(401).json({error: 'not authenticated'});
    }
    else {
        next();
    }
};