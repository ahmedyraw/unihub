package com.example.unihub.service;

import com.example.unihub.dto.CreateConversationRequest;
import com.example.unihub.dto.ConversationResponse;
import com.example.unihub.dto.MessageResponse;
import com.example.unihub.dto.SendMessageRequest;
import com.example.unihub.enums.MessageType;
import com.example.unihub.model.User;
import com.example.unihub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile("test-chat")
@RequiredArgsConstructor
@Slf4j
public class ChatSystemValidator implements CommandLineRunner {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        log.info("🧪 Starting Chat System Validation...");
        
        try {
            // Get two test users
            List<User> users = userRepository.findAll();
            if (users.size() < 2) {
                log.error("❌ Need at least 2 users in database for testing");
                return;
            }
            
            User user1 = users.get(0);
            User user2 = users.get(1);
            
            log.info("✅ Found test users: {} and {}", user1.getName(), user2.getName());
            
            // Test 1: Create conversation
            log.info("📝 Test 1: Creating conversation...");
            CreateConversationRequest request = new CreateConversationRequest();
            request.setParticipantIds(List.of(user2.getUserId()));
            request.setIsGroup(false);
            
            ConversationResponse conversation = chatService.createConversation(request, user1.getUserId());
            log.info("✅ Conversation created: ID={}", conversation.getConversationId());
            
            // Test 2: Send message
            log.info("📝 Test 2: Sending message...");
            SendMessageRequest messageRequest = new SendMessageRequest();
            messageRequest.setConversationId(conversation.getConversationId());
            messageRequest.setContent("Hello! This is a test message.");
            messageRequest.setType(MessageType.TEXT);
            
            MessageResponse message = chatService.sendMessage(messageRequest, user1.getUserId());
            log.info("✅ Message sent: ID={}", message.getMessageId());
            
            // Test 3: Get conversations
            log.info("📝 Test 3: Getting conversations...");
            List<ConversationResponse> conversations = chatService.getUserConversations(user1.getUserId());
            log.info("✅ Found {} conversations", conversations.size());
            
            // Test 4: Get messages
            log.info("📝 Test 4: Getting messages...");
            var messages = chatService.getMessages(conversation.getConversationId(), user1.getUserId(), 0, 10);
            log.info("✅ Found {} messages", messages.getTotalElements());
            
            // Test 5: Add reaction
            log.info("📝 Test 5: Adding reaction...");
            chatService.addReaction(message.getMessageId(), "👍", user2.getUserId());
            log.info("✅ Reaction added");
            
            // Test 6: Mark as read
            log.info("📝 Test 6: Marking as read...");
            chatService.markAsRead(conversation.getConversationId(), user2.getUserId());
            log.info("✅ Marked as read");
            
            log.info("🎉 All tests passed! Chat system is working correctly.");
            
        } catch (Exception e) {
            log.error("❌ Validation failed: {}", e.getMessage(), e);
        }
    }
}
