package com.springboot.MyTodoList.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.stereotype.Service;

@Service
public class DeepSeekService{
    private final CloseableHttpClient httpClient;
    private final HttpPost httpPost;
    private final ObjectMapper objectMapper;

    public DeepSeekService(CloseableHttpClient httpClient, HttpPost httpPost) {
        this.httpClient = httpClient;
        this.httpPost = httpPost;
        this.objectMapper = new ObjectMapper();
    }

    public String generateText(String prompt) throws IOException, org.apache.hc.core5.http.ParseException {
        String requestBody = String.format("{\"model\": \"deepseek-chat\",\"messages\": [{\"role\": \"user\", \"content\": \"%s\"}]}", prompt);

        try {
            httpPost.setEntity(new StringEntity(requestBody));
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                String jsonResponse = EntityUtils.toString(response.getEntity());
                JsonNode rootNode = objectMapper.readTree(jsonResponse);
                return rootNode.path("choices").get(0).path("message").path("content").asText();
            }
        } catch (IOException e) {
            throw e;
        }
    }
}
