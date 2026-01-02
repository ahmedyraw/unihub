package com.example.unihub.controller;

import com.example.unihub.dto.*;
import com.example.unihub.service.ChatService;
import com.example.unihub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserService userService;

    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> createConversation(
            @RequestBody CreateConversationRequest request,
            Authentication authentication) {
        Long userId = userService.getUserByEmail(authentication.getName()).getUserId();
        return ResponseEntity.ok(chatService.createConversation(request, userId));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations(Authentication authentication) {
        Long userId = userService.getUserByEmail(authentication.getName()).getUserId();
        return ResponseEntity.ok(chatService.getUserConversations(userId));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Page<MessageResponse>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        Long userId = userService.getUserByEmail(authentication.getName()).getUserId();
        return ResponseEntity.ok(chatService.getMessages(conversationId, userId, page, size));
    }

    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long conversationId,
            Authentication authentication) {
        Long userId = userService.getUserByEmail(authentication.getName()).getUserId();
        chatService.markAsRead(conversationId, userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/messages/{messageId}")
    public ResponseEntity<MessageResponse> editMessage(
            @PathVariable Long messageId,
            @RequestBody String content,
            Authentication authentication) {
        Long userId = userService.getUserByEmail(authentication.getName()).getUserId();
        return ResponseEntity.ok(chatService.editMessage(messageId, content, userId));
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long messageId,
            Authentication authentication) {
        Long userId = userService.getUserByEmail(authentication.getName()).getUserId();
        chatService.deleteMessage(messageId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/messages/{messageId}/reactions")
    public ResponseEntity<Void> addReaction(
            @PathVariable Long messageId,
            @RequestParam String emoji,
            Authentication authentication) {
        Long userId = userService.getUserByEmail(authentication.getName()).getUserId();
        chatService.addReaction(messageId, emoji, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/conversations/{conversationId}/search")
    public ResponseEntity<List<MessageResponse>> searchMessages(
            @PathVariable Long conversationId,
            @RequestParam String query,
            Authentication authentication) {
        Long userId = userService.getUserByEmail(authentication.getName()).getUserId();
        return ResponseEntity.ok(chatService.searchMessages(conversationId, query, userId));
    }

    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable Long conversationId,
            Authentication authentication) {
        Long userId = userService.getUserByEmail(authentication.getName()).getUserId();
        chatService.deleteConversationForUser(conversationId, userId);
        return ResponseEntity.ok().build();
    }
}
