import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import fs from "fs/promises";
import path from "path";

// Configuration
const CONVEX_URL = process.env.CONVEX_URL;
const CHUNK_SIZE = 1000; // characters per chunk
const CHUNK_OVERLAP = 200; // overlap between chunks
const PARALLEL_FILES = 2; // Process this many files concurrently (reduced for safety)
const PARALLEL_CHUNKS = 5; // Insert this many chunks concurrently per file (2 files × 5 = 10 concurrent actions)
const DELAY_BETWEEN_BATCHES = 100; // ms delay between chunk batches
const DELAY_BETWEEN_FILE_BATCHES = 500; // ms delay between file batches
const MAX_RETRIES = 3; // Number of retries for failed operations
const RETRY_DELAY = 2000; // ms delay before retrying

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Split text into overlapping chunks
 */
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;
    let chunk = text.slice(start, end);

    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf(".");
      const lastNewline = chunk.lastIndexOf("\n");
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > chunkSize * 0.5) {
        chunk = chunk.slice(0, breakPoint + 1);
        end = start + breakPoint + 1;
      }
    }

    const trimmed = chunk.trim();
    if (trimmed) {
      chunks.push(trimmed);
    }

    start = end - overlap;
  }

  return chunks;
}

/**
 * Insert a single chunk with retry logic
 */
async function insertChunkWithRetry(chunk, filename, chunkIndex, totalChunks, client, retries = 0) {
  const textWithMetadata = `[Source: ${filename}, Chunk ${chunkIndex + 1}/${totalChunks}]\n\n${chunk}`;

  try {
    await client.action(api.rag.add, {
      text: textWithMetadata,
    });
    return true;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      const isRateLimit =
        error.message?.includes("rate limit") ||
        error.message?.includes("429") ||
        error.message?.includes("too many requests");

      const delay = isRateLimit ? RETRY_DELAY * 2 : RETRY_DELAY;

      console.log(
        `\n  ⚠ Retry ${retries + 1}/${MAX_RETRIES} for ${filename} chunk ${chunkIndex + 1} (${error.message})`
      );

      await sleep(delay);
      return insertChunkWithRetry(chunk, filename, chunkIndex, totalChunks, client, retries + 1);
    } else {
      throw new Error(`Failed after ${MAX_RETRIES} retries: ${error.message}`);
    }
  }
}

/**
 * Process chunks in parallel batches with rate limiting
 */
async function insertChunksInParallel(chunks, filename, client) {
  const insertPromises = [];
  let successCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    insertPromises.push(
      insertChunkWithRetry(chunks[i], filename, i, chunks.length, client)
        .then(() => {
          successCount++;
          return true;
        })
        .catch((error) => {
          console.error(`\n  ✗ Failed chunk ${i + 1} in ${filename}: ${error.message}`);
          return false;
        })
    );

    // Process in batches to avoid overwhelming the server
    if (insertPromises.length >= PARALLEL_CHUNKS || i === chunks.length - 1) {
      await Promise.all(insertPromises);
      insertPromises.length = 0; // Clear array

      if (i < chunks.length - 1) {
        process.stdout.write(`\r  Progress: ${successCount}/${chunks.length} chunks...`);
        await sleep(DELAY_BETWEEN_BATCHES); // Rate limiting delay
      }
    }
  }

  return successCount;
}

/**
 * Process a single text file and insert chunks into Convex RAG
 */
async function processFile(filepath, client, fileNum, totalFiles) {
  const filename = path.basename(filepath);

  try {
    const content = await fs.readFile(filepath, "utf-8");
    const chunks = chunkText(content);

    console.log(`[${fileNum}/${totalFiles}] Processing ${filename} (${chunks.length} chunks)...`);

    const inserted = await insertChunksInParallel(chunks, filename, client);

    if (inserted === chunks.length) {
      console.log(`\r✓ ${filename}: ${inserted}/${chunks.length} chunks inserted successfully`);
    } else {
      console.log(`\r⚠ ${filename}: ${inserted}/${chunks.length} chunks inserted (some failed)`);
    }

    return { filename, inserted, total: chunks.length, success: inserted === chunks.length };
  } catch (error) {
    console.error(`✗ ${filename}: ${error.message}`);
    return { filename, inserted: 0, total: 0, success: false, error: error.message };
  }
}

/**
 * Process files in parallel batches with rate limiting
 */
async function processFilesInBatches(txtFiles, client) {
  let totalChunks = 0;
  const results = [];
  let fileNum = 0;

  for (let i = 0; i < txtFiles.length; i += PARALLEL_FILES) {
    const batch = txtFiles.slice(i, i + PARALLEL_FILES);
    const batchNum = Math.floor(i / PARALLEL_FILES) + 1;
    const totalBatches = Math.ceil(txtFiles.length / PARALLEL_FILES);

    console.log(`\n${"=".repeat(50)}`);
    console.log(`Batch ${batchNum}/${totalBatches} (${batch.length} files)`);
    console.log("=".repeat(50));

    const batchResults = await Promise.all(
      batch.map((filepath) => {
        fileNum++;
        return processFile(filepath, client, fileNum, txtFiles.length);
      })
    );

    results.push(...batchResults);
    totalChunks += batchResults.reduce((sum, r) => sum + r.inserted, 0);

    // Delay between file batches to prevent rate limiting
    if (i + PARALLEL_FILES < txtFiles.length) {
      console.log(`\nWaiting ${DELAY_BETWEEN_FILE_BATCHES}ms before next batch...`);
      await sleep(DELAY_BETWEEN_FILE_BATCHES);
    }
  }

  return { totalChunks, results };
}

/**
 * Process all .txt files in directory
 */
async function main(directory) {
  if (!CONVEX_URL) {
    console.error("Error: Set CONVEX_URL environment variable");
    process.exit(1);
  }

  // Initialize Convex client
  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // Find all .txt files
    const files = await fs.readdir(directory);
    const txtFiles = files
      .filter((file) => file.endsWith(".txt"))
      .map((file) => path.join(directory, file));

    if (txtFiles.length === 0) {
      console.log(`No .txt files found in ${directory}`);
      return;
    }

    console.log(`\nFound ${txtFiles.length} .txt files`);
    console.log(`Configuration:`);
    console.log(`  - Processing ${PARALLEL_FILES} files at a time`);
    console.log(`  - ${PARALLEL_CHUNKS} chunks per file in parallel`);
    console.log(`  - ${DELAY_BETWEEN_BATCHES}ms delay between chunk batches`);
    console.log(`  - ${DELAY_BETWEEN_FILE_BATCHES}ms delay between file batches`);
    console.log(`  - ${MAX_RETRIES} retries for failed operations\n`);

    const startTime = Date.now();
    const { totalChunks, results } = await processFilesInBatches(txtFiles, client);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("SUMMARY");
    console.log("=".repeat(50));

    const successfulFiles = results.filter((r) => r.success).length;
    const failedFiles = results.filter((r) => !r.success);

    console.log(`✓ Successfully processed: ${successfulFiles}/${txtFiles.length} files`);
    console.log(`✓ Total chunks inserted: ${totalChunks}`);
    console.log(`⏱ Time elapsed: ${elapsed}s`);
    console.log(`📊 Average: ${(totalChunks / elapsed).toFixed(1)} chunks/sec`);

    if (failedFiles.length > 0) {
      console.log(`\n⚠ Failed files (${failedFiles.length}):`);
      failedFiles.forEach((f) => {
        console.log(`  - ${f.filename}: ${f.error || "partial failure"}`);
      });
    }

    console.log("=".repeat(50));
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Run the script
const directory = process.argv[2];

if (!directory) {
  console.log("Usage: node script.js <directory_path>");
  process.exit(1);
}

main(directory);
