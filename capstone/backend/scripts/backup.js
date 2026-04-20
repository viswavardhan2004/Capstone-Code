const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Backup all JSON data files
function backupData() {
  const dataDir = path.join(__dirname, '..', 'data');
  const backupDir = path.join(__dirname, '..', 'backups');
  
  // Create backups directory if doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Create timestamped backup folder
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFolder = path.join(backupDir, `backup-${timestamp}`);
  fs.mkdirSync(backupFolder);
  
  // Files to backup
  const files = [
    'users.json',
    'messages.json',
    'gigs.json',
    'orders.json',
    'transactions.json',
    'clientTransactions.json',
    'student.json'
  ];
  
  let backedUpCount = 0;
  
  files.forEach(file => {
    try {
      const source = path.join(dataDir, file);
      const dest = path.join(backupFolder, file);
      
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, dest);
        backedUpCount++;
        console.log(`✅ Backed up: ${file}`);
      }
    } catch (error) {
      console.log(`⚠️  Failed to backup ${file}:`, error.message);
    }
  });
  
  // Create backup metadata
  const metadata = {
    timestamp: new Date().toISOString(),
    files: backedUpCount,
    backupId: crypto.randomBytes(8).toString('hex'),
    description: 'Micro-Job data backup'
  };
  
  fs.writeFileSync(
    path.join(backupFolder, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log(`\n✅ Backup completed!`);
  console.log(`📁 Location: ${backupFolder}`);
  console.log(`📊 Files backed up: ${backedUpCount}`);
  console.log(`🆔 Backup ID: ${metadata.backupId}`);
  
  return backupFolder;
}

// Restore from backup
function restoreBackup(backupId) {
  const backupDir = path.join(__dirname, '..', 'backups');
  
  // Find backup folder
  const backups = fs.readdirSync(backupDir);
  let backupPath = null;
  
  for (const backup of backups) {
    const metadataPath = path.join(backupDir, backup, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      if (metadata.backupId === backupId) {
        backupPath = path.join(backupDir, backup);
        break;
      }
    }
  }
  
  if (!backupPath) {
    console.log('❌ Backup not found');
    return;
  }
  
  const dataDir = path.join(__dirname, '..', 'data');
  const files = fs.readdirSync(backupPath).filter(f => f.endsWith('.json') && f !== 'metadata.json');
  
  files.forEach(file => {
    try {
      const source = path.join(backupPath, file);
      const dest = path.join(dataDir, file);
      fs.copyFileSync(source, dest);
      console.log(`✅ Restored: ${file}`);
    } catch (error) {
      console.log(`⚠️  Failed to restore ${file}:`, error.message);
    }
  });
  
  console.log(`\n✅ Restore completed!`);
}

// List all backups
function listBackups() {
  const backupDir = path.join(__dirname, '..', 'backups');
  
  if (!fs.existsSync(backupDir)) {
    console.log('No backups found');
    return;
  }
  
  const backups = fs.readdirSync(backupDir);
  console.log('📁 Available backups:\n');
  
  backups.forEach(backup => {
    const metadataPath = path.join(backupDir, backup, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      console.log(`ID: ${metadata.backupId}`);
      console.log(`Date: ${metadata.timestamp}`);
      console.log(`Files: ${metadata.files}`);
      console.log(`Folder: ${backup}\n`);
    }
  });
}

// Main
const command = process.argv[2];

if (command === 'backup') {
  backupData();
} else if (command === 'restore') {
  const backupId = process.argv[3];
  if (!backupId) {
    console.log('Usage: node backup.js restore <backup_id>');
    listBackups();
  } else {
    restoreBackup(backupId);
  }
} else if (command === 'list') {
  listBackups();
} else {
  console.log('Micro-Job Data Backup Tool\n');
  console.log('Usage:');
  console.log('  Backup:  node backup.js backup');
  console.log('  Restore: node backup.js restore <backup_id>');
  console.log('  List:    node backup.js list\n');
  console.log('Examples:');
  console.log('  node backup.js backup');
  console.log('  node backup.js list');
  console.log('  node backup.js restore abc123def456');
}
