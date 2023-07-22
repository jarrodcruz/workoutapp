const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
// log each event
const logEvents = async (message, logFileName) => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      // if logs directory doesn't exist, make one
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromises.appendFile(
      // make new file with the logfilename and have its content be the log item
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (err) {
    console.log(err);
  }
};
// middleware
const logger = (req, res, next) => {
  // logs all events, only writes to logs if it's from an external origin 
  if (`${req.headers.origin}` != "undefined") {
    // origin is undefined if from development environment
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
  }
  console.log(`${req.method} ${req.path}`);
  next();
};

module.exports = { logEvents, logger };
