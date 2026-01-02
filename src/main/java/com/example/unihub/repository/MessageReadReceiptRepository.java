package com.example.unihub.repository;

import com.example.unihub.model.MessageReadReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageReadReceiptRepository extends JpaRepository<MessageReadReceipt, Long> {

    List<MessageReadReceipt> findByMessageMessageId(Long messageId);

    Optional<MessageReadReceipt> findByMessageMessageIdAndUserUserId(Long messageId, Long userId);
}
