const errorHandler = (err, req, res, next) => {
    console.log(err.stack.red);

    let msg = err.message || 'Server error';
    let statusCode = err.statusCode || 500;

    if (err.name === 'CastError') {
        msg = 'Bootcamp not found';
        statusCode = 404;
    } else if (typeof err === 'MongoServerError') {
        msg = 'Data validation error';
        statusCode = 401;
    }
    else if (err.name == 'MongoError') {
        msg = err.code === 11000 ? 'Duplicate value entered' : 'Database validation error';
    }

    res.status(statusCode).json({
        sucess: false, 
        error: msg 
    });

    next();
}

module.exports = errorHandler;