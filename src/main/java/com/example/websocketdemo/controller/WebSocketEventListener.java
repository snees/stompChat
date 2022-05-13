package com.example.websocketdemo.controller;

import com.example.websocketdemo.model.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class); // 프로그램 오류 발생 시 필요

    @Autowired
 // 메시지를 도착지까지 보내는 MessageSendingOperations<Destination>을 스프링 프레임워크에 맞춘 것
    private SimpMessageSendingOperations messagingTemplate; 
    
    //브로커가 connect 메시지에 대한 응답 //stomp의 connected 프레임을 보낸 경우(SessionConnectEvent이후)에 발생
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) { 
        logger.info("Received a new websocket connection"); 
    }

    //클라이언트로부터 Disconnect메시지를 받거나 WebSocket세션이 닫히는 경우 자동으로 이벤트 발생
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        String username = (String) headerAccessor.getSessionAttributes().get("username");
        if(username != null) {
            logger.info("User Disconnected : " + username);

            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setType(ChatMessage.MessageType.LEAVE);
            chatMessage.setSender(username);

         // converAndSend - 객체를 받아 변환 -> 전송 전 MessagePostProcessor로 후처리 -> 전송
            messagingTemplate.convertAndSend("/topic/public", chatMessage); 
        }
    }
}
