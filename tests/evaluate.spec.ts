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

import { test, expect } from './fixtures.js';

test('browser_evaluate', async ({ client, server }) => {
  expect(await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.HELLO_WORLD },
  })).toContainTextContent(`- Page Title: Title`);

  const result = await client.callTool({
    name: 'browser_evaluate',
    arguments: {
      function: '() => document.title',
    },
  });
  expect(result).toContainTextContent(`"Title"`);
});

test('browser_evaluate (element)', async ({ client, server }) => {
  server.setContent('/', `
    <body style="background-color: red">Hello, world!</body>
  `, 'text/html');
  await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.PREFIX },
  });

  expect(await client.callTool({
    name: 'browser_evaluate',
    arguments: {
      function: 'element => element.style.backgroundColor',
      element: 'body',
      ref: 'e1',
    },
  })).toContainTextContent(`- Result: "red"`);
});

test('browser_evaluate (error)', async ({ client, server }) => {
  expect(await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.HELLO_WORLD },
  })).toContainTextContent(`- Page Title: Title`);

  // Test with a bogus expression that will cause a JavaScript error
  const result = await client.callTool({
    name: 'browser_evaluate',
    arguments: {
      function: '() => { undefinedVariable.nonExistentMethod(); }',
    },
  });

  // Check that error MCP response is returned
  expect(result.isError).toBe(true);

  // Check that JavaScript error details are contained in the response
  expect(result.content?.[0].text).toContain('undefinedVariable is not defined');
});
