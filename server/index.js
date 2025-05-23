const { connectDB } = require("./config/db")

require("dotenv").config()
connectDB()
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: ["http://localhost:3000", "https://icecream-crm.vercel.app"]
}));
app.use(express.json());
app.use("/", require("./routes"))


app.listen(process.env.PORT || 8080, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
})