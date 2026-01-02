package com.example.unihub.repository;

import com.example.unihub.model.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long> {

    List<MessageReaction> findByMessageMessageId(Long messageId);

    Optional<MessageReaction> findByMessageMessageIdAndUserUserIdAndEmoji(Long messageId, Long userId, String emoji);
}
