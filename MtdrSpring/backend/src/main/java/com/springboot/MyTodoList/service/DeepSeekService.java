package com.springboot.MyTodoList.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class DeepSeekService{
    private static final Logger logger = LoggerFactory.getLogger(DeepSeekService.class);
    private final CloseableHttpClient httpClient;
    private final HttpPost httpPost;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public DeepSeekService(CloseableHttpClient httpClient, HttpPost httpPost) {
        this.httpClient = httpClient;
        this.httpPost = httpPost;
    }

    public String generateText(String prompt) throws IOException, org.apache.hc.core5.http.ParseException {
        // Gemini API Format
        ObjectNode rootNode = objectMapper.createObjectNode();
        ArrayNode contents = rootNode.putArray("contents");
        ObjectNode content = contents.addObject();
        ArrayNode parts = content.putArray("parts");
        ObjectNode part = parts.addObject();
        
        // Combining system instructions and user prompt for Gemini Flash
        String systemInstructions = "Eres un asistente de gestión de proyectos experto. " +
            "Tu habilidad especial es generar reportes para Telegram usando Markdown. " +
            "REGLAS DE FORMATO CRÍTICAS:\n" +
            "1. NO uses encabezados con '#' (ej. ### Resumen). En su lugar usa negritas (ej. *Resumen*).\n" +
            "2. NO uses separadores '---'.\n" +
            "3. Usa '*' para listas y para poner texto en *negritas*.\n" +
            "4. Usa '_' para texto en _itálicas_.\n" +
            "5. Mantén una estructura limpia y fácil de leer en móviles.\n\n";
            
        String fullPrompt = "Instrucciones de Sistema: " + systemInstructions + "Usuario: " + prompt;
        part.put("text", fullPrompt);

        String requestBody = objectMapper.writeValueAsString(rootNode);

        try {
            httpPost.setEntity(new StringEntity(requestBody));
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                String responseBody = EntityUtils.toString(response.getEntity());
                JsonNode responseJson = objectMapper.readTree(responseBody);
                
                // Gemini response structure: candidates[0].content.parts[0].text
                if (responseJson.has("candidates") && responseJson.get("candidates").isArray() && responseJson.get("candidates").size() > 0) {
                    JsonNode candidate = responseJson.get("candidates").get(0);
                    if (candidate.has("content") && candidate.get("content").has("parts")) {
                        return candidate.get("content").get("parts").get(0).get("text").asText();
                    }
                }
                
                logger.error("Error en respuesta de Gemini: " + responseBody);
                return "⚠️ Error de la API de Gemini: " + responseBody;
            }
        } catch (Exception e) {
            logger.error("Error al comunicarse con Gemini: " + e.getMessage());
            return "⚠️ Error de conexión/sistema: " + e.getMessage();
        }
    }
}
