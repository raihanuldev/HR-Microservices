const express = require('express');
const {createProxyMiddleware} = require('http-proxy-middleware');
const logger = require('./middileware/logger');
require("dotenv").config();

const app = express();
const port = 5000;

app.use(logger);

// This is root for auth Service.
app.use("/api/auth",createProxyMiddleware({
    target:process.env.AUTHSERVICESURL,
    changeOrigin:true,
}))

// This is root for employee Service.
app.use("/api/employees",createProxyMiddleware({
    target:process.env.EMPLOYEESERVICESURL || "http://localhost:5002",
    changeOrigin:true,
}))
// This is root for attendance Service.
app.use("/api/attendance-apis",createProxyMiddleware({
    target:process.env.ATTENDANCESERVICURL || "http://localhost:5003",
    changeOrigin:true,
}))

app.get("/server-health",async(req,res)=>{
    res.send({status:"Success",message:"Server is running"});
})


app.listen(port,()=>{
    console.log("API GateWay Is Successfully Started.. Port ",port);
})