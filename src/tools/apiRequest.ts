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
import { z } from 'zod';
import { defineTool } from './tool.js';

// Input schema for the API request tool
const apiRequestInputSchema = z.object({
  method: z.string().optional().default('GET'),
  url: z.string(),
  headers: z.record(z.string()).optional(),
  data: z.any().optional(),
  expect: z.object({
    status: z.number().optional(),
    contentType: z.string().optional()
  }).optional(),
  // For response body validation
  body: z.any().optional(), // partial/exact match for JSON or string
  bodyRegex: z.string().optional() // regex for text or stringified JSON
});

const apiRequestTool = defineTool({
  capability: 'api_request',
  schema: {
    name: 'api_request',
    title: 'API Request',
    description: 'Perform an HTTP API request and validate the response.',
    inputSchema: apiRequestInputSchema,
    type: 'readOnly'
  },
  async handle(ctx: any, input: any) {
    const { method, url, headers, data, expect } = input;
    const { request } = await import('playwright');
    const context = await request.newContext();
    const response = await context.fetch(url, {
      method: method || 'GET',
      headers,
      data
    });

    const status = response.status();
    const contentType = response.headers()['content-type'] || '';
    let responseBody;
    if (contentType.includes('application/json'))
      responseBody = await response.json();
    else
      responseBody = await response.text();

    // Basic validation
    const validation = {
      status: expect?.status ? status === expect.status : true,
      contentType: expect?.contentType ? contentType.includes(expect.contentType) : true
    };

    // --- Enhanced Response Body Validation ---
    let bodyValidation = { matched: true, reason: 'No body expectation set.' };
    if (expect?.body !== undefined) {
      if (typeof responseBody === 'object' && responseBody !== null && typeof expect.body === 'object') {
        // Partial match: all keys/values in expect.body must be present in responseBody
        bodyValidation.matched = Object.entries(expect.body).every(
            ([k, v]) => JSON.stringify(responseBody[k]) === JSON.stringify(v)
        );
        bodyValidation.reason = bodyValidation.matched
          ? 'Partial/exact body match succeeded.'
          : 'Partial/exact body match failed.';
      } else if (typeof expect.body === 'string') {
        bodyValidation.matched = JSON.stringify(responseBody) === expect.body || responseBody === expect.body;
        bodyValidation.reason = bodyValidation.matched
          ? 'Exact string match succeeded.'
          : 'Exact string match failed.';
      } else {
        bodyValidation.matched = false;
        bodyValidation.reason = 'Body type mismatch.';
      }
    }
    if (expect?.bodyRegex) {
      const pattern = new RegExp(expect.bodyRegex);
      const target = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);
      const regexMatch = pattern.test(target);
      bodyValidation = {
        matched: regexMatch,
        reason: regexMatch ? 'Regex match succeeded.' : 'Regex match failed.'
      };
    }
    // --- End Enhanced Validation ---

    await context.dispose();
    return {
      code: [],
      resultOverride: {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ok: validation.status && validation.contentType && bodyValidation.matched,
            status,
            contentType,
            body: responseBody,
            validation,
            bodyValidation
          }, null, 2)
        }]
      },
      captureSnapshot: false,
      waitForNetwork: false
    };
  }
});
export default [
  apiRequestTool
];
