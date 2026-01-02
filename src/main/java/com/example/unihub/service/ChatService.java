package com.example.unihub.service;

import com.example.unihub.dto.*;
import com.example.unihub.enums.MessageType;
import com.example.unihub.model.*;
import com.example.unihub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;
    private final MessageReactionRepository reactionRepository;
    private final MessageReadReceiptRepository readReceiptRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ConversationResponse createConversation(CreateConversationRequest request, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check for existing direct conversation
        if (!request.getIsGroup() && request.getParticipantIds().size() == 1) {
            Optional<Conversation> existing = conversationRepository
                    .findDirectConversation(currentUserId, request.getParticipantIds().get(0));
            if (existing.isPresent()) {
                return buildConversationResponse(existing.get(), currentUserId);
            }
        }

        Conversation conversation = new Conversation();
        conversation.setIsGroup(request.getIsGroup());
        conversation.setGroupName(request.getIsGroup() && (request.getGroupName() == null || request.getGroupName().trim().isEmpty()) 
                ? "Untitled" 
                : request.getGroupName());
        conversation.setCreatedBy(currentUser);
        conversation = conversationRepository.save(conversation);

        // Add current user
        addParticipant(conversation, currentUser, true);

        // Add other participants
        for (Long userId : request.getParticipantIds()) {
            if (!userId.equals(currentUserId)) {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found: " + userId));
                addParticipant(conversation, user, false);
            }
        }

        return buildConversationResponse(conversation, currentUserId);
    }

    private void addParticipant(Conversation conversation, User user, boolean isAdmin) {
        ConversationParticipant participant = new ConversationParticipant();
        participant.setConversation(conversation);
        participant.setUser(user);
        participant.setIsAdmin(isAdmin);
        participantRepository.save(participant);
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getUserConversations(Long userId) {
        try {
            List<Conversation> conversations = conversationRepository.findByUserId(userId);
            return conversations.stream()
                    .map(c -> buildConversationResponse(c, userId))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Return empty list if no conversations or error
            return new ArrayList<>();
        }
    }

    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request, Long senderId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        // Verify sender is participant
        participantRepository.findByConversationConversationIdAndUserUserId(
                conversation.getConversationId(), senderId)
                .orElseThrow(() -> new RuntimeException("Not a participant"));

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(request.getContent());
        message.setType(request.getType() != null ? request.getType() : MessageType.TEXT);
        message.setFileUrl(request.getFileUrl());
        message.setFileName(request.getFileName());
        message.setFileSize(request.getFileSize());

        if (request.getReplyToMessageId() != null) {
            Message replyTo = messageRepository.findById(request.getReplyToMessageId()).orElse(null);
            message.setReplyToMessage(replyTo);
        }

        message = messageRepository.save(message);

        // Update conversation timestamp
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        MessageResponse response = buildMessageResponse(message);

        // Send via WebSocket
        messagingTemplate.convertAndSend("/topic/conversation/" + conversation.getConversationId(), response);

        return response;
    }

    @Transactional(readOnly = true)
    public Page<MessageResponse> getMessages(Long conversationId, Long userId, int page, int size) {
        // Verify user is participant
        participantRepository.findByConversationConversationIdAndUserUserId(conversationId, userId)
                .orElseThrow(() -> new RuntimeException("Not a participant"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository
                .findByConversationConversationIdAndIsDeletedFalseOrderByCreatedAtDesc(conversationId, pageable);

        return messages.map(this::buildMessageResponse);
    }

    @Transactional
    public void markAsRead(Long conversationId, Long userId) {
        ConversationParticipant participant = participantRepository
                .findByConversationConversationIdAndUserUserId(conversationId, userId)
                .orElseThrow(() -> new RuntimeException("Not a participant"));

        participant.setLastReadAt(LocalDateTime.now());
        participantRepository.save(participant);

        // Notify others
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/read",
                Map.of("userId", userId, "readAt", LocalDateTime.now()));
    }

    @Transactional
    public MessageResponse editMessage(Long messageId, String newContent, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSender().getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }

        message.setContent(newContent);
        message.setIsEdited(true);
        message = messageRepository.save(message);

        MessageResponse response = buildMessageResponse(message);
        messagingTemplate.convertAndSend("/topic/conversation/" + message.getConversation().getConversationId() + "/edit", response);

        return response;
    }

    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSender().getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }

        message.setIsDeleted(true);
        message.setContent(null);
        messageRepository.save(message);

        messagingTemplate.convertAndSend("/topic/conversation/" + message.getConversation().getConversationId() + "/delete",
                Map.of("messageId", messageId));
    }

    @Transactional
    public void addReaction(Long messageId, String emoji, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<MessageReaction> existing = reactionRepository
                .findByMessageMessageIdAndUserUserIdAndEmoji(messageId, userId, emoji);

        if (existing.isPresent()) {
            reactionRepository.delete(existing.get());
        } else {
            MessageReaction reaction = new MessageReaction();
            reaction.setMessage(message);
            reaction.setUser(user);
            reaction.setEmoji(emoji);
            reactionRepository.save(reaction);
        }

        MessageResponse response = buildMessageResponse(message);
        messagingTemplate.convertAndSend("/topic/conversation/" + message.getConversation().getConversationId() + "/reaction", response);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> searchMessages(Long conversationId, String query, Long userId) {
        participantRepository.findByConversationConversationIdAndUserUserId(conversationId, userId)
                .orElseThrow(() -> new RuntimeException("Not a participant"));

        List<Message> messages = messageRepository.searchMessages(conversationId, query);
        return messages.stream().map(this::buildMessageResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteConversationForUser(Long conversationId, Long userId) {
        ConversationParticipant participant = participantRepository
                .findByConversationConversationIdAndUserUserId(conversationId, userId)
                .orElseThrow(() -> new RuntimeException("Not a participant"));

        // Mark as hidden instead of deleting
        participant.setIsHidden(true);
        participantRepository.save(participant);
    }

    private ConversationResponse buildConversationResponse(Conversation conversation, Long currentUserId) {
        ConversationResponse response = new ConversationResponse();
        response.setConversationId(conversation.getConversationId());
        response.setIsGroup(conversation.getIsGroup());
        response.setGroupName(conversation.getGroupName());
        response.setGroupAvatar(conversation.getGroupAvatar());
        response.setCreatedAt(conversation.getCreatedAt());
        response.setUpdatedAt(conversation.getUpdatedAt());

        try {
            List<ConversationParticipant> participants = participantRepository
                    .findByConversationConversationId(conversation.getConversationId());

            response.setParticipants(participants.stream().map(p -> {
                ConversationResponse.ParticipantInfo info = new ConversationResponse.ParticipantInfo();
                info.setUserId(p.getUser().getUserId());
                info.setName(p.getUser().getName());
                info.setEmail(p.getUser().getEmail());
                info.setIsAdmin(p.getIsAdmin());
                info.setLastReadAt(p.getLastReadAt());
                return info;
            }).collect(Collectors.toList()));

            // Get last message
            Page<Message> lastMessages = messageRepository
                    .findByConversationConversationIdAndIsDeletedFalseOrderByCreatedAtDesc(
                            conversation.getConversationId(), PageRequest.of(0, 1));
            if (!lastMessages.isEmpty()) {
                response.setLastMessage(buildMessageResponse(lastMessages.getContent().get(0)));
            }

            // Get unread count
            Long unreadCount = participantRepository.countUnreadMessages(conversation.getConversationId(), currentUserId);
            response.setUnreadCount(unreadCount != null ? unreadCount : 0L);
        } catch (Exception e) {
            // Set defaults if error
            response.setParticipants(new ArrayList<>());
            response.setUnreadCount(0L);
        }

        return response;
    }

    private MessageResponse buildMessageResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setMessageId(message.getMessageId());
        response.setConversationId(message.getConversation().getConversationId());
        response.setContent(message.getContent());
        response.setType(message.getType());
        response.setFileUrl(message.getFileUrl());
        response.setFileName(message.getFileName());
        response.setFileSize(message.getFileSize());
        response.setIsEdited(message.getIsEdited());
        response.setIsDeleted(message.getIsDeleted());
        response.setCreatedAt(message.getCreatedAt());
        response.setUpdatedAt(message.getUpdatedAt());

        MessageResponse.UserSummary sender = new MessageResponse.UserSummary();
        sender.setUserId(message.getSender().getUserId());
        sender.setName(message.getSender().getName());
        sender.setEmail(message.getSender().getEmail());
        response.setSender(sender);

        if (message.getReplyToMessage() != null) {
            MessageResponse.MessageSummary replySummary = new MessageResponse.MessageSummary();
            replySummary.setMessageId(message.getReplyToMessage().getMessageId());
            replySummary.setContent(message.getReplyToMessage().getContent());
            MessageResponse.UserSummary replySender = new MessageResponse.UserSummary();
            replySender.setUserId(message.getReplyToMessage().getSender().getUserId());
            replySender.setName(message.getReplyToMessage().getSender().getName());
            replySender.setEmail(message.getReplyToMessage().getSender().getEmail());
            replySummary.setSender(replySender);
            response.setReplyToMessage(replySummary);
        }

        // Reactions
        List<MessageReaction> reactions = reactionRepository.findByMessageMessageId(message.getMessageId());
        Map<String, List<MessageResponse.UserSummary>> reactionMap = reactions.stream()
                .collect(Collectors.groupingBy(
                        MessageReaction::getEmoji,
                        Collectors.mapping(r -> {
                            MessageResponse.UserSummary u = new MessageResponse.UserSummary();
                            u.setUserId(r.getUser().getUserId());
                            u.setName(r.getUser().getName());
                            u.setEmail(r.getUser().getEmail());
                            return u;
                        }, Collectors.toList())
                ));
        response.setReactions(reactionMap);

        // Read receipts
        List<MessageReadReceipt> receipts = readReceiptRepository.findByMessageMessageId(message.getMessageId());
        List<MessageResponse.UserSummary> readBy = receipts.stream().map(r -> {
            MessageResponse.UserSummary u = new MessageResponse.UserSummary();
            u.setUserId(r.getUser().getUserId());
            u.setName(r.getUser().getName());
            u.setEmail(r.getUser().getEmail());
            return u;
        }).collect(Collectors.toList());
        response.setReadBy(readBy);

        return response;
    }
}
