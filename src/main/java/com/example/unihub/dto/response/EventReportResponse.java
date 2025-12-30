package com.example.unihub.dto.response;

import com.example.unihub.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventReportResponse {
    private Long reportId;
    private Long eventId;
    private String eventTitle;
    private String eventCreatorName;
    private Long reportedById;
    private String reportedByName;
    private String reason;
    private ReportStatus status;
    private LocalDateTime createdAt;
}
