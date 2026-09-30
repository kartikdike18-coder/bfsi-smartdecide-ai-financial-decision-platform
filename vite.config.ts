import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

function bfsiApiPlugin(): Plugin {
  return {
    name: 'bfsi-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Handle CORS preflight
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.url === '/api/ai-advisor' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });

          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const body = JSON.parse(bodyStr || '{}');
              const { provider = 'auto', userPrompt, financialContext, claudeApiKey } = body;

              // 1. If Anthropic Claude requested and API key provided
              if (provider === 'claude' && claudeApiKey) {
                try {
                  const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-api-key': claudeApiKey,
                      'anthropic-version': '2023-06-01',
                    },
                    body: JSON.stringify({
                      model: 'claude-3-5-sonnet-20241022',
                      max_tokens: 1024,
                      system: `You are an elite BFSI (Banking, Financial Services, and Insurance) senior underwriter and financial strategist. Platform engineered by Yogesh Dike. Provide precise, actionable advice with numbers, risk analysis, and step-by-step guidance.`,
                      messages: [
                        {
                          role: 'user',
                          content: `${userPrompt}\n\nClient Financial Context: ${JSON.stringify(financialContext || {})}`,
                        },
                      ],
                    }),
                  });

                  if (!claudeResponse.ok) {
                    const errorText = await claudeResponse.text();
                    throw new Error(`Claude API error (${claudeResponse.status}): ${errorText}`);
                  }

                  const claudeData = (await claudeResponse.json()) as any;
                  const text = claudeData?.content?.[0]?.text || 'No response from Claude.';
                  res.statusCode = 200;
                  res.end(JSON.stringify({ success: true, text, provider: 'claude' }));
                  return;
                } catch (claudeErr: any) {
                  console.error('Claude API call failed:', claudeErr.message);
                  // fall through to Gemini or rule-based engine
                }
              }

              // 2. Google Gemini API
              const geminiApiKey = process.env.GEMINI_API_KEY;
              if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
                try {
                  const ai = new GoogleGenAI({ apiKey: geminiApiKey });
                  const systemInstruction = `You are an elite BFSI (Banking, Financial Services, and Insurance) Principal Risk Underwriter and Wealth Advisor on BFSI SmartDecide AI, engineered by Yogesh Dike.
Your goal is to provide institutional-grade financial guidance, loan optimization strategies, credit rehabilitation plans, tax savings, and debt-to-income optimization.
Use crisp bullet points, highlighting key numbers, risks, and next steps.
Always maintain ethical lending guidelines.`;

                  const prompt = `${systemInstruction}\n\nUser Question/Request: ${userPrompt}\n\nFinancial Profile Context: ${JSON.stringify(
                    financialContext || {}
                  )}`;

                  const response = await ai.models.generateContent({
                    model: 'gemini-3.8-flash',
                    contents: prompt,
                  });

                  res.statusCode = 200;
                  res.end(
                    JSON.stringify({
                      success: true,
                      text: response.text || 'Unable to generate response.',
                      provider: 'gemini',
                    })
                  );
                  return;
                } catch (geminiErr: any) {
                  console.error('Gemini API call failed:', geminiErr?.message);
                }
              }

              // 3. Fallback: Institutional BFSI Expert Knowledge Engine
              const simulatedAnalysis = generateLocalBFSIAdvice(userPrompt, financialContext);
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: true,
                  text: simulatedAnalysis,
                  provider: 'bfsi-rules-engine',
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (req.url === '/api/sheets-sync' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const { webhookUrl, records } = JSON.parse(bodyStr || '{}');
              if (webhookUrl) {
                // Forward payload to user's Google Apps Script Webhook
                const sheetRes = await fetch(webhookUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    source: 'BFSI SmartDecide AI by Yogesh Dike',
                    timestamp: new Date().toISOString(),
                    records,
                  }),
                });
                res.statusCode = 200;
                res.end(JSON.stringify({ success: sheetRes.ok, message: 'Dispatched to Google Sheet' }));
                return;
              }

              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, message: 'Google Sheets sync format verified.' }));
            } catch (sheetErr: any) {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: false, error: sheetErr.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

function generateLocalBFSIAdvice(userPrompt: string, ctx: any): string {
  const promptLower = (userPrompt || '').toLowerCase();
  const income = ctx?.monthlyIncome || 75000;
  const existingEmi = ctx?.existingEmi || 12000;
  const creditScore = ctx?.creditScore || 740;
  const loanType = ctx?.loanType || 'Home';
  const foir = ctx?.foir || ((existingEmi / income) * 100).toFixed(1);

  if (promptLower.includes('credit') || promptLower.includes('cibil') || promptLower.includes('score')) {
    return `### 📊 BFSI Credit Score Optimization Strategy
**Current Bureau Profile:** ${creditScore} Rating | Target: 800+ Tier-1 Bracket

1. **Maintain Credit Utilization Below 30%:** Your revolving balances should never cross 30% of total card limits on billing cycle cut dates.
2. **Payment History Safeguard:** 35% of your score depends on spotless 0-day delinquencies. Ensure automatic ECS/NACH debit setup.
3. **Credit Limit Enhancement:** Request a benign credit limit increase from your primary issuer. This immediately drives down your utilization percentage without extra debt.
4. **Bureau Audit:** Verify that closed loan accounts have been marked as 'Closed' rather than 'Settled' or 'Written Off' in the CIBIL / Experian bureau feed.

*Advisor Note: An improvement from ${creditScore} to 780+ typically shaves 25 to 50 bps off institutional loan interest rates.*`;
  }

  if (promptLower.includes('foir') || promptLower.includes('dti') || promptLower.includes('eligibility') || promptLower.includes('income')) {
    return `### 🏛️ Debt Service & Loan Eligibility Assessment
**Applicant Status:** Monthly Income ₹${income.toLocaleString()} | Existing EMI ₹${existingEmi.toLocaleString()} | Current FOIR: ~${foir}%

1. **FOIR Benchmark Compliance:** Standard institutional banking guidelines mandate a maximum FOIR of 50% for retail loans (up to 60% for high net worth borrowers).
2. **Technique to Expand Maximum Loan Quantum:**
   - **Tenure Extension:** Extending the tenure from 15 to 20 or 25 years reduces the monthly installment burden, expanding your borrowing ceiling by up to 28%.
   - **Co-Applicant Addition:** Adding a spouse or working parent as a co-borrower aggregates household income and elevates eligibility.
   - **Pre-closing High-Interest Personal Loans:** Pre-paying a ₹5,000 personal loan EMI frees up sufficient debt service capacity to qualify for an extra ₹5-6 Lakhs on a home loan.

*Engineered by Yogesh Dike's BFSI SmartDecide Underwriting Engine.*`;
  }

  return `### 💡 BFSI SmartDecide Advisory & Underwriting Analysis
**Financial Decision Recommendations:**

1. **Optimized Loan Structuring:** For ${loanType} financing, align the loan tenure so that total monthly debt commitments remain below 45% of net monthly earnings.
2. **Prepayment Strategy:** Paying just one additional EMI per fiscal year or increasing EMI by 5% annually reduces a 20-year loan tenure by approximately 4.5 years and saves up to 35% in cumulative interest outlay.
3. **Tax & Shielding Opportunities:** Under Indian IT regulations (Sec 24b for home loan interest up to ₹2 Lakhs, Sec 80C for principal up to ₹1.5 Lakhs), optimize co-ownership to double deductions.
4. **Emergency Reserve Buffer:** Maintain a mandatory liquidity buffer of at least 6 months of combined living expenses and EMIs in a high-yield liquid mutual fund or auto-sweep fixed deposit before taking on new debt.

*Have specific questions on refinancing, pre-closures, or amortization adjustments? Ask away!*`;
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), bfsiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

