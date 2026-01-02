package com.example.unihub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypingIndicatorMessage {
    private Long conversationId;
    private Long userId;
    private String userName;
    private Boolean isTyping;
}
