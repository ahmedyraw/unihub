package com.example.unihub.repository;

import com.example.unihub.model.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {

    List<ConversationParticipant> findByConversationConversationId(Long conversationId);

    Optional<ConversationParticipant> findByConversationConversationIdAndUserUserId(Long conversationId, Long userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.conversationId = :conversationId " +
           "AND m.createdAt > COALESCE((SELECT cp.lastReadAt FROM ConversationParticipant cp " +
           "WHERE cp.conversation.conversationId = :conversationId AND cp.user.userId = :userId), m.conversation.createdAt)")
    Long countUnreadMessages(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
}
