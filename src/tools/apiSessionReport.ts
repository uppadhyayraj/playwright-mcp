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
import fs from 'node:fs/promises';
import path from 'node:path';

// Use the same global session store as apiRequest
const sessionStore: Map<string, any> = (globalThis as any).__API_SESSION_STORE__ || new Map();
(globalThis as any).__API_SESSION_STORE__ = sessionStore;

const reportsDir = path.resolve(process.cwd(), 'reports');

async function ensureReportsDir() {
  try {
    await fs.mkdir(reportsDir, { recursive: true });
  } catch {}
}

function renderHtmlReport(session: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>API Test Session Report: ${session.sessionId}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2em; }
    h1 { color: #2c3e50; }
    .pass { color: green; }
    .fail { color: red; }
    table { border-collapse: collapse; width: 100%; margin-top: 1em; }
    th, td { border: 1px solid #ccc; padding: 0.5em; }
    th { background: #f5f5f5; }
    pre { background: #f8f8f8; padding: 0.5em; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>API Test Session Report</h1>
  <p><b>Session ID:</b> ${session.sessionId}</p>
  <p><b>Status:</b> ${session.status}</p>
  <p><b>Start Time:</b> ${session.startTime}</p>
  <p><b>Log Entries:</b> ${session.logs.length}</p>
  <hr/>
  <h2>Requests & Results</h2>
  <table>
    <tr><th>#</th><th>Type</th><th>Request</th><th>Status</th><th>Validation</th><th>Time</th></tr>
    ${session.logs.map((log: any, i: number) => {
    if (log.type === 'request' || log.type === 'single') {
      const ok = log.validation?.status && log.validation?.contentType && log.bodyValidation?.matched;
      return `<tr><td>${i + 1}</td><td>${log.type}</td><td><pre>${JSON.stringify(log.request, null, 2)}</pre></td><td>${log.response?.status ?? log.result?.status}</td><td class='${ok ? 'pass' : 'fail'}'>${ok ? 'PASS' : 'FAIL'}<br>${log.bodyValidation?.reason ?? ''}</td><td>${log.timestamp}</td></tr>`;
    } else if (log.type === 'chain') {
      return log.steps
        .filter((step: any) => step && (step.method || step.url || step.request)) // Skip empty steps
        .map((step: any, j: number) => {
          const ok = step.validation?.status && step.validation?.contentType && step.bodyValidation?.matched;
          const requestInfo = step.request || { 
            method: step.method, 
            url: step.url, 
            headers: step.headers, 
            data: step.data 
          };
          // Only render if we have some request data to show
          if (Object.keys(requestInfo).length === 0) return '';
          return `<tr><td>${i + 1}.${j + 1}</td><td>chain-step</td><td><pre>${JSON.stringify(requestInfo, null, 2)}</pre></td><td>${step.status || ''}</td><td class='${ok ? 'pass' : 'fail'}'>${ok ? 'PASS' : 'FAIL'}<br>${step.bodyValidation?.reason ?? ''}</td><td>${step.timestamp || ''}</td></tr>`;
        })
        .join('');
    }
    return '';
  }).join('')}
  </table>
</body>
</html>`;
}

const apiSessionReportTool = defineTool({
  capability: 'api_session_report',
  schema: {
    name: 'api_session_report',
    title: 'API Session HTML Report',
    description: 'Generate and retrieve an HTML report for an API test session by sessionId.',
    inputSchema: z.object({
      sessionId: z.string()
    }),
    type: 'readOnly'
  },
  async handle(ctx: any, input: { sessionId: string }) {
    const session = sessionStore.get(input.sessionId);
    if (!session) {
      return {
        code: [],
        resultOverride: { content: [{ type: 'text', text: `Session not found: ${input.sessionId}` }] },
        captureSnapshot: false,
        waitForNetwork: false
      };
    }
    await ensureReportsDir();
    const html = renderHtmlReport(session);
    const reportPath = path.join(reportsDir, `session-${input.sessionId}.html`);
    await fs.writeFile(reportPath, html, 'utf8');
    return {
      code: [],
      resultOverride: { content: [{ type: 'text', text: `HTML report generated: ${reportPath}` }] },
      captureSnapshot: false,
      waitForNetwork: false
    };
  }
});

export default apiSessionReportTool;
export const apiSessionReportTools = [apiSessionReportTool];
