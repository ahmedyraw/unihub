package com.example.unihub.repository;

import com.example.unihub.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT DISTINCT c FROM Conversation c JOIN ConversationParticipant p ON p.conversation.conversationId = c.conversationId WHERE p.user.userId = :userId AND (p.isHidden = false OR p.isHidden IS NULL) ORDER BY c.updatedAt DESC")
    List<Conversation> findByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE c.conversationId IN " +
           "(SELECT p1.conversation.conversationId FROM ConversationParticipant p1 WHERE p1.user.userId = :userId1) " +
           "AND c.conversationId IN " +
           "(SELECT p2.conversation.conversationId FROM ConversationParticipant p2 WHERE p2.user.userId = :userId2) " +
           "AND c.isGroup = false")
    Optional<Conversation> findDirectConversation(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
