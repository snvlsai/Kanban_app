const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Atlas connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Passport config
const initialize = require("./config/passportConfig");
initialize(passport);

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "fallbacksecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    dbName: "kanban",
    collectionName: "sessions",
  }),
};

// Middlewares
app.use(helmet());
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Routers
app.use("/api/auth", require("./routes/api/homeRouter"));
app.use("/api", require("./routes/api/boardRouter"));
app.use("/api", require("./routes/api/listRouter"));
app.use("/api", require("./routes/api/cardRouter"));

// Production: Serve frontend
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  app.use(express.static(path.join(__dirname, "./client/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.join(__dirname, "./client/build", "index.html"))
  );
}

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
