import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Manually load environment variables from .env.local
const envLocalPath = path.resolve('.env.local');
if (!fs.existsSync(envLocalPath)) {
  console.error('Error: .env.local not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envLocalPath, 'utf8');
const envVars = Object.fromEntries(
  envContent
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const firstEq = line.indexOf('=');
      if (firstEq === -1) return [line.trim(), ''];
      return [line.slice(0, firstEq).trim(), line.slice(firstEq + 1).trim()];
    })
);

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const STORAGE_ROOT = './public/storage';

async function listFilesRecursive(bucket, folder = '') {
  let allFiles = [];
  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: 1000,
    offset: 0
  });

  if (error) {
    console.error(`Error listing folder "${folder}" in bucket "${bucket}":`, error.message);
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
  const filePath = path.join(STORAGE_ROOT, bucket, fileName);
  const dirPath = path.dirname(filePath);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    // console.log(`- Skipping ${bucket}/${fileName} (already exists)`);
    return false;
  }

  process.stdout.write(`Downloading ${bucket}/${fileName}... `);
  const { data, error } = await supabase.storage.from(bucket).download(fileName);
  if (error) {
    console.error(`FAILED: ${error.message}`);
    return false;
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
  console.log(`DONE ✅`);
  return true;
}

async function runSync() {
  console.log(`🚀 Starting storage sync to ${STORAGE_ROOT}`);
  console.log(`Target project: ${supabaseUrl}\n`);
  
  const buckets = ['avatars', 'profile-images'];
  let totalDownloaded = 0;
  let totalSkipped = 0;

  for (const bucket of buckets) {
    console.log(`Checking bucket: ${bucket}...`);
    const files = await listFilesRecursive(bucket);
    console.log(`Found ${files.length} files in ${bucket}. Checking for updates...`);
    
    for (const file of files) {
      const wasDownloaded = await downloadFile(bucket, file);
      if (wasDownloaded) totalDownloaded++;
      else totalSkipped++;
    }
    console.log('');
  }

  console.log('=====================================');
  console.log(`✅ SYNC COMPLETE`);
  console.log(`Downloaded: ${totalDownloaded} new files`);
  console.log(`Up to date: ${totalSkipped} existing files`);
  console.log('=====================================');
  console.log('NOTICE: Your app will now serve these files locally!');
}

runSync().catch(console.error);
