package com.example.unihub.controller;

import com.example.unihub.dto.MessageResponse;
import com.example.unihub.dto.SendMessageRequest;
import com.example.unihub.dto.TypingIndicatorMessage;
import com.example.unihub.service.ChatService;
import com.example.unihub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, Authentication auth) {
        Long userId = userService.getUserByEmail(auth.getName()).getUserId();
        MessageResponse response = chatService.sendMessage(request, userId);
        messagingTemplate.convertAndSend("/topic/conversation/" + request.getConversationId(), response);
    }

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingIndicatorMessage message) {
        messagingTemplate.convertAndSend("/topic/conversation/" + message.getConversationId() + "/typing", message);
    }
}
