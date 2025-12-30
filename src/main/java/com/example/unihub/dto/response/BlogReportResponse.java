package com.example.unihub.dto.response;

import com.example.unihub.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlogReportResponse {
    private Long reportId;
    private Long blogId;
    private String blogTitle;
    private String blogAuthorName;
    private Long reportedById;
    private String reportedByName;
    private String reason;
    private ReportStatus status;
    private LocalDateTime createdAt;
}
