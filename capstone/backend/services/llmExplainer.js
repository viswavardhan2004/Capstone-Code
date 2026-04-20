const FraudAlert = require('../models/FraudAlert');

async function generateFraudExplanation(triggeredRules, similarCases, alertId) {
  try {
    const prompt = 
      'You are a fraud analyst for a student freelancing platform.\n' +
      'Write ONE plain-English paragraph explaining this fraud alert\n' +
      'for a non-technical university IT administrator.\n' +
      'Triggered rules: ' + JSON.stringify(triggeredRules) + '\n' +
      'Similar past cases: ' + JSON.stringify(similarCases) + '\n' +
      'Explain what happened and what action to take.';

    // NodeJS native fetch
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY || 'dummy_key',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    let explanation;
    
    if (data.content && data.content[0] && data.content[0].text) {
      explanation = data.content[0].text;
    } else {
      explanation = 'Explanation generation failed. ' + JSON.stringify(data);
    }

    await FraudAlert.findByIdAndUpdate(alertId, {
      $set: { llmExplanation: explanation }
    });
    
    return explanation;
  } catch (error) {
    console.error('LLM Extractor Error:', error.message);
    throw error;
  }
}

module.exports = { generateFraudExplanation };
