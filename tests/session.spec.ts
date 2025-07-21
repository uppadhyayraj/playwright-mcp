/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from 'fs';
import path from 'path';

import { test, expect } from './fixtures.js';

test('check that session is saved', async ({ startClient, server, mcpMode }, testInfo) => {
  const outputDir = testInfo.outputPath('output');

  const { client } = await startClient({
    args: ['--save-session', `--output-dir=${outputDir}`],
  });

  expect(await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.HELLO_WORLD },
  })).toContainTextContent(`Navigate to http://localhost`);

  // Check that session file exists
  const files = fs.readdirSync(outputDir);
  const sessionFiles = files.filter(f => f.startsWith('session') && f.endsWith('.yml'));
  expect(sessionFiles.length).toBe(1);

  // Check session file content
  const sessionContent = fs.readFileSync(path.join(outputDir, sessionFiles[0]), 'utf8');
  expect(sessionContent).toContain('- browser_navigate:');
  expect(sessionContent).toContain('params:');
  expect(sessionContent).toContain('url: ' + server.HELLO_WORLD);
  expect(sessionContent).toContain('snapshot:');
});

test('check that session includes multiple tool calls', async ({ startClient, server, mcpMode }, testInfo) => {
  const outputDir = testInfo.outputPath('output');

  const { client } = await startClient({
    args: ['--save-session', `--output-dir=${outputDir}`],
  });

  // Navigate to a page
  await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.HELLO_WORLD },
  });

  // Take a snapshot
  await client.callTool({
    name: 'browser_snapshot',
    arguments: {},
  });

  // Check that session file exists and contains both calls
  const files = fs.readdirSync(outputDir);
  const sessionFiles = files.filter(f => f.startsWith('session') && f.endsWith('.yml'));
  expect(sessionFiles.length).toBe(1);

  const sessionContent = fs.readFileSync(path.join(outputDir, sessionFiles[0]), 'utf8');
  expect(sessionContent).toContain('- browser_navigate:');
  expect(sessionContent).toContain('- browser_snapshot:');

  // Check that snapshot files exist
  const snapshotFiles = files.filter(f => f.includes('snapshot.yaml'));
  expect(snapshotFiles.length).toBeGreaterThan(0);
});
