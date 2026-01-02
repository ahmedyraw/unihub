package com.example.unihub.dto;

import com.example.unihub.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    private Long conversationId;
    private String content;
    private MessageType type;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private Long replyToMessageId;
}
