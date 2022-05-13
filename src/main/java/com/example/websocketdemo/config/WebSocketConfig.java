package com.example.websocketdemo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker // websocket서버를 사용
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) { // registerStompEndpoints - 클라이언트에서 websocket에 접속하는 endpoint등록
        registry.addEndpoint("/ws").withSockJS(); // withSockJS - 브라우저에서 websocket을 지원하지 않을 경우 fallback옵션 활성화
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) { //
        registry.setApplicationDestinationPrefixes("/app"); // /app으로 시작하는 메시지만 메시지 핸들러로 라우팅
        registry.enableSimpleBroker("/topic");   // Enables a simple in-memory broker 
    }
}
