const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // allowed origins or other software/desktop apps are allowed to access backend rest api
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // handles header options
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
