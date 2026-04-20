const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/microjob').then(async () => {
    const { runFraudCheck } = require('./middleware/fraudDetection');
    const clientObjectId = "69d7ec7e17cc98888378b608";
    const studentObjectId = "69d7ebb717cc98888378b606";
    const clientIP = "::1";

    console.log("Running fraud check...");
    const result = await runFraudCheck(clientObjectId, studentObjectId, null, clientIP);
    console.log("Result:", JSON.stringify(result, null, 2));
    process.exit(0);
});
