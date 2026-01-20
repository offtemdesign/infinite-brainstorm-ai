// netlify/functions/generate.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Seules les requêtes POST sont autorisées
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt, apiKey } = JSON.parse(event.body);

    if (!prompt || !apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Paramètres manquants' }),
      };
    }

    const response = await fetch('https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 60,
          temperature: 0.8,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur Hugging Face: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Erreur de la fonction Netlify:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};