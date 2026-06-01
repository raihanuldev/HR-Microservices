const logger = (req, res, next) => {
    const start = Date.now();

    console.log(`\n📥 Incoming Request`);
    console.log(`${req.method} ${req.originalUrl}`);
    console.log(`Time: ${new Date().toISOString()}`);

    res.on("finish", () => {
        const duration = Date.now() - start;

        console.log(`📤 Response Sent`);
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode}`);
        console.log(`⏱️ Duration: ${duration}ms`);
        console.log(`-----------------------------`);
    });

    next();
};

module.exports = logger;