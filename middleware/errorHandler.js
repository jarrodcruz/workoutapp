const { logEvents } = require("./logger");

// error handler, overrides default express error handler
const errorHandler = (err, req, res, next) => {
  // logs errors to error log file
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );
  console.log(err.stack); // help for debugging errors

  const status = res.statusCode ? res.statusCode : 500; // server error

  res.status(status); // set status to what ternary determined

  res.json({ message: err.message });
};

module.exports = errorHandler;
