package com.example.unihub.dto;

import com.example.unihub.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long messageId;
    private Long conversationId;
    private UserSummary sender;
    private String content;
    private MessageType type;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private MessageSummary replyToMessage;
    private Boolean isEdited;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Map<String, List<UserSummary>> reactions;
    private List<UserSummary> readBy;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private Long userId;
        private String name;
        private String email;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageSummary {
        private Long messageId;
        private String content;
        private UserSummary sender;
    }
}
