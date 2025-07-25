// src/services/GeminiService.js
// Serviço de IA REAL usando Google AI (Gemini)

// Chave de API fornecida
const API_KEY = 'AIzaSyDXnpQVQdI-nQ88N8-F-loSPsarVxyZFoA';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

export const getGeminiResponse = async (message, vehicleContext = null) => {
  try {
    // Contextualizar a mensagem com dados do veículo, se disponível
    let prompt = message;
    if (vehicleContext && vehicleContext.id) { // Só contextualiza se houver dados reais
      prompt = `Você é um assistente automotivo inteligente chamado thIAguinho. 
                Dados do veículo do usuário: ${JSON.stringify(vehicleContext, null, 2)}.
                Com base nesses dados, responda de forma clara, útil e específica à seguinte pergunta:
                "${message}"
                Se os dados do veículo não forem relevantes para a pergunta, responda da melhor forma possível.`;
    } else {
      prompt = `Você é um assistente automotivo inteligente chamado thIAguinho. 
                Responda de forma clara e útil à seguinte pergunta:
                "${message}"`;
    }

    console.log("🧠 Enviando prompt para a IA:", prompt);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erro na API da IA:", response.status, errorText);
      throw new Error(`Falha na requisição à IA: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("📥 Resposta da IA recebida:", JSON.stringify(data, null, 2));

    // Extrair o texto da resposta
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (aiText) {
      return aiText.trim();
    } else {
      console.warn("⚠️ Resposta da IA vazia ou inválida.");
      return "Desculpe, não consegui formular uma resposta específica neste momento. Pode tentar reformular a pergunta?";
    }

  } catch (error) {
    console.error("❌ Erro ao obter resposta da IA:", error);
    // Fallback para resposta simulada em caso de erro
    const fallbackResponses = [
      `Não consegui acessar a IA no momento, mas posso te ajudar com outras coisas! Você perguntou sobre "${message}".`,
      `Estou tendo dificuldades para me conectar à IA. Sobre "${message}", posso te dar algumas dicas gerais.`,
      `Serviço de IA temporariamente indisponível. Para "${message}", recomendo verificar manualmente.`
    ];
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
};
