const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/microjob').then(async () => {
  const User = require('./models/User');
  const u = await User.find({ email: { $in: ['priya@college.edu', 'badclient@gmail.com'] } });
  console.log(JSON.stringify(u, null, 2));
  process.exit(0);
});
