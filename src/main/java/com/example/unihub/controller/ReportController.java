package com.example.unihub.controller;

import com.example.unihub.dto.response.BlogReportResponse;
import com.example.unihub.dto.response.EventReportResponse;
import com.example.unihub.enums.ReportStatus;
import com.example.unihub.model.BlogReport;
import com.example.unihub.model.EventReport;
import com.example.unihub.model.User;
import com.example.unihub.service.ReportService;
import com.example.unihub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final UserService userService;

    /**
     * Report a blog
     * POST /api/reports/blogs/{id}
     */
    @PostMapping("/blogs/{id}")
    public ResponseEntity<BlogReport> reportBlog(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User reporter = userService.getUserByEmail(email);
        String reason = request.get("reason");
        
        BlogReport report = reportService.reportBlog(id, reporter.getUserId(), reason);
        return ResponseEntity.status(HttpStatus.CREATED).body(report);
    }

    /**
     * Report an event
     * POST /api/reports/events/{id}
     */
    @PostMapping("/events/{id}")
    public ResponseEntity<EventReport> reportEvent(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User reporter = userService.getUserByEmail(email);
        String reason = request.get("reason");
        
        EventReport report = reportService.reportEvent(id, reporter.getUserId(), reason);
        return ResponseEntity.status(HttpStatus.CREATED).body(report);
    }

    /**
     * Get all blog reports (Supervisor/Admin only)
     * GET /api/reports/blogs
     */
    @GetMapping("/blogs")
    public ResponseEntity<List<BlogReportResponse>> getBlogReports(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false, defaultValue = "false") boolean pending) {
        
        if (status != null) {
            return ResponseEntity.ok(reportService.getBlogReportsByStatus(status));
        }
        if (pending) {
            return ResponseEntity.ok(reportService.getPendingBlogReports());
        }
        return ResponseEntity.ok(reportService.getAllBlogReports());
    }

    /**
     * Get all event reports (Supervisor/Admin only)
     * GET /api/reports/events
     */
    @GetMapping("/events")
    public ResponseEntity<List<EventReportResponse>> getEventReports(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false, defaultValue = "false") boolean pending) {
        
        if (status != null) {
            return ResponseEntity.ok(reportService.getEventReportsByStatus(status));
        }
        if (pending) {
            return ResponseEntity.ok(reportService.getPendingEventReports());
        }
        return ResponseEntity.ok(reportService.getAllEventReports());
    }

    /**
     * Review blog report (Supervisor/Admin only)
     * PUT /api/reports/blogs/{id}/review
     */
    @PutMapping("/blogs/{id}/review")
    public ResponseEntity<String> reviewBlogReport(@PathVariable Long id) {
        reportService.reviewBlogReport(id);
        return ResponseEntity.ok("Blog report reviewed");
    }

    /**
     * Dismiss blog report (Supervisor/Admin only)
     * PUT /api/reports/blogs/{id}/dismiss
     */
    @PutMapping("/blogs/{id}/dismiss")
    public ResponseEntity<String> dismissBlogReport(@PathVariable Long id) {
        reportService.dismissBlogReport(id);
        return ResponseEntity.ok("Blog report dismissed");
    }

    /**
     * Review event report (Supervisor/Admin only)
     * PUT /api/reports/events/{id}/review
     */
    @PutMapping("/events/{id}/review")
    public ResponseEntity<String> reviewEventReport(@PathVariable Long id) {
        reportService.reviewEventReport(id);
        return ResponseEntity.ok("Event report reviewed");
    }

    /**
     * Dismiss event report (Supervisor/Admin only)
     * PUT /api/reports/events/{id}/dismiss
     */
    @PutMapping("/events/{id}/dismiss")
    public ResponseEntity<String> dismissEventReport(@PathVariable Long id) {
        reportService.dismissEventReport(id);
        return ResponseEntity.ok("Event report dismissed");
    }
}
