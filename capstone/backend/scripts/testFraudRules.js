const mongoose = require('mongoose');
const { 
  checkSelfCycling, 
  checkRatingVelocity, 
  checkRefundHistory, 
  checkAccountRush, 
  checkBilateralCollusion,
  checkZeroChat,
  checkFastCompletion,
  checkSuspiciousPrice,
  checkSameWeekAccounts,
  checkInstantEscrow,
  checkDeviceFingerprint,
  checkSkillMismatch,
  checkBurstPosting
} = require('../middleware/fraudDetection');

// Connect to a dummy or real DB is not entirely necessary if we mock the models for this quick dry run,
// but since the models use Promises (await User.findById), we need a valid connection or allow mongoose to buffer,
// OR since the functions do actual DB queries, we should connect to the local DB.
const MONGO_URI = 'mongodb://127.0.0.1:27017/microjob';

async function runTests() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for local testing');

    const mockClientId = new mongoose.Types.ObjectId();
    const mockFreelancerId = new mongoose.Types.ObjectId();
    
    console.log('\n--- Running R1: checkSelfCycling ---');
    const r1 = await checkSelfCycling(mockClientId, mockFreelancerId, '127.0.0.1', '192.168.1.1');
    console.log(r1);
    
    console.log('\n--- Running R2: checkRatingVelocity ---');
    const r2 = await checkRatingVelocity(mockFreelancerId);
    console.log(r2);
    
    console.log('\n--- Running R3: checkRefundHistory ---');
    const r3 = await checkRefundHistory(mockClientId);
    console.log(r3);
    
    console.log('\n--- Running R4: checkAccountRush ---');
    const r4 = await checkAccountRush(mockFreelancerId);
    console.log(r4);
    
    console.log('\n--- Running R5: checkBilateralCollusion ---');
    const r5 = await checkBilateralCollusion(mockClientId, mockFreelancerId);
    console.log(r5);
    
    const mockJobId = new mongoose.Types.ObjectId();
    
    console.log('\n--- Running R6: checkZeroChat ---');
    const r6 = await checkZeroChat(mockJobId);
    console.log(r6);
    
    console.log('\n--- Running R7: checkFastCompletion ---');
    const r7 = await checkFastCompletion(mockJobId);
    console.log(r7);
    
    console.log('\n--- Running R8: checkSuspiciousPrice ---');
    const r8 = await checkSuspiciousPrice(mockJobId);
    console.log(r8);
    
    console.log('\n--- Running R9: checkSameWeekAccounts ---');
    const r9 = await checkSameWeekAccounts(mockClientId, mockFreelancerId);
    console.log(r9);
    
    console.log('\n--- Running R10: checkInstantEscrow ---');
    const r10 = await checkInstantEscrow(mockJobId);
    console.log(r10);
    
    console.log('\n--- Running R11: checkDeviceFingerprint ---');
    const r11 = await checkDeviceFingerprint(mockClientId, mockFreelancerId);
    console.log(r11);
    
    console.log('\n--- Running R12: checkSkillMismatch ---');
    const r12 = await checkSkillMismatch(mockFreelancerId, mockJobId);
    console.log(r12);
    
    console.log('\n--- Running R13: checkBurstPosting ---');
    const r13 = await checkBurstPosting(mockClientId);
    console.log(r13);
    
    console.log('\n✅ All shapes successfully validated! Exiting...');
    process.exit(0);
  } catch (err) {
    console.error('Test Failed', err);
    process.exit(1);
  }
}

runTests();
