import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
// Manually load environment variables from .env.local
const envLocalPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envLocalPath, 'utf8');
const envVars = Object.fromEntries(
  envContent
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('='))
    .map(([key, value]) => [key.trim(), value ? value.trim() : ''])
);

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BACKUP_ROOT = './backup';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const BACKUP_DIR = path.join(BACKUP_ROOT, TIMESTAMP);

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function backupTable(tableName) {
  console.log(`Backing up table: ${tableName}...`);
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) {
    console.error(`Error backing up table ${tableName}:`, error.message);
    return;
  }
  fs.writeFileSync(
    path.join(BACKUP_DIR, `${tableName}.json`),
    JSON.stringify(data, null, 2)
  );
  console.log(`✅ Table ${tableName} backed up (${data.length} rows).`);
}

async function listFilesRecursive(bucket, folder = '') {
  let allFiles = [];
  const { data, error } = await supabase.storage.from(bucket).list(folder);

  if (error) {
    console.error(`Error listing folder ${folder} in bucket ${bucket}:`, error.message);
    return [];
  }

  for (const item of data) {
    if (item.id === null) {
      // It's a folder
      const subFiles = await listFilesRecursive(bucket, folder ? `${folder}/${item.name}` : item.name);
      allFiles = allFiles.concat(subFiles);
    } else {
      // It's a file
      allFiles.push(folder ? `${folder}/${item.name}` : item.name);
    }
  }

  return allFiles;
}

async function downloadFile(bucket, fileName) {
  const filePath = path.join(BACKUP_DIR, 'storage', bucket, fileName);
  const dirPath = path.dirname(filePath);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const { data, error } = await supabase.storage.from(bucket).download(fileName);
  if (error) {
    console.error(`Error downloading ${fileName} from ${bucket}:`, error.message);
    return;
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ Downloaded: ${bucket}/${fileName}`);
}

async function runBackup() {
  console.log(`Starting backup to ${BACKUP_DIR}...`);
  
  // Backup database tables
  const tables = ['profiles', 'user_roles', 'monkey_d'];
  for (const table of tables) {
    await backupTable(table);
  }

  // Backup storage buckets
  const buckets = ['avatars', 'profile-images'];
  for (const bucket of buckets) {
    console.log(`Listing files in bucket: ${bucket}...`);
    const files = await listFilesRecursive(bucket);
    console.log(`Found ${files.length} files in ${bucket}. Starting download...`);
    for (const file of files) {
      await downloadFile(bucket, file);
    }
  }

  // Save metadata
  fs.writeFileSync(
    path.join(BACKUP_DIR, 'metadata.json'),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      tables,
      buckets,
    }, null, 2)
  );

  console.log('\n=====================================');
  console.log('✅ ALL BACKUPS COMPLETE SUCCESSFULLY.');
  console.log(`Backup location: ${BACKUP_DIR}`);
  console.log('=====================================');
}

runBackup().catch(console.error);
