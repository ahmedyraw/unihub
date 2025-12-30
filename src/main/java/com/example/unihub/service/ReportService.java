package com.example.unihub.service;

import com.example.unihub.dto.response.BlogReportResponse;
import com.example.unihub.dto.response.EventReportResponse;
import com.example.unihub.enums.BlogStatus;
import com.example.unihub.enums.EventStatus;
import com.example.unihub.enums.NotificationType;
import com.example.unihub.enums.ReportStatus;
import com.example.unihub.exception.ResourceNotFoundException;
import com.example.unihub.model.*;
import com.example.unihub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final BlogReportRepository blogReportRepository;
    private final EventReportRepository eventReportRepository;
    private final BlogRepository blogRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final GamificationService gamificationService;

    /**
     * Report a blog (one-time per user per blog)
     */
    @Transactional
    public BlogReport reportBlog(Long blogId, Long reporterId, String reason) {
        log.info("User {} reporting blog {} - Reason: {}", reporterId, blogId, reason);
        
        Blog blog = blogRepository.findById(blogId)
            .orElseThrow(() -> new ResourceNotFoundException("Blog", "id", blogId));

        if (blog.getStatus() == BlogStatus.REJECTED) {
            throw new IllegalStateException("Cannot report a rejected blog");
        }
        
        User reporter = userRepository.findById(reporterId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", reporterId));
        
        // Check if user already reported this blog (one-time report limit)
        boolean alreadyReported = blogReportRepository.existsByBlogBlogIdAndReportedByUserId(blogId, reporterId);
        if (alreadyReported) {
            throw new IllegalStateException("You have already reported this blog");
        }
        
        BlogReport report = new BlogReport();
        report.setBlog(blog);
        report.setReportedBy(reporter);
        report.setReason(reason);
        report.setStatus(ReportStatus.PENDING);
        
        return blogReportRepository.save(report);
    }

    /**
     * Report an event (one-time per user per event)
     */
    @Transactional
    public EventReport reportEvent(Long eventId, Long reporterId, String reason) {
        log.info("User {} reporting event {} - Reason: {}", reporterId, eventId, reason);
        
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new IllegalStateException("Cannot report a cancelled event");
        }
        if (event.getEndDate() != null && event.getEndDate().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Cannot report a completed event");
        }
        
        User reporter = userRepository.findById(reporterId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", reporterId));
        
        // Check if user already reported this event (one-time report limit)
        boolean alreadyReported = eventReportRepository.existsByEventEventIdAndReportedByUserId(eventId, reporterId);
        if (alreadyReported) {
            throw new IllegalStateException("You have already reported this event");
        }
        
        EventReport report = new EventReport();
        report.setEvent(event);
        report.setReportedBy(reporter);
        report.setReason(reason);
        report.setStatus(ReportStatus.PENDING);
        
        return eventReportRepository.save(report);
    }

    /**
     * Get all pending blog reports
     */
    public List<BlogReportResponse> getPendingBlogReports() {
        return blogReportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING)
            .stream()
            .map(this::toBlogReportResponse)
            .toList();
    }

    /**
     * Get all pending event reports
     */
    public List<EventReportResponse> getPendingEventReports() {
        return eventReportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING)
            .stream()
            .map(this::toEventReportResponse)
            .toList();
    }

    /**
     * Get all blog reports (any status)
     */
    public List<BlogReportResponse> getAllBlogReports() {
        return blogReportRepository.findAll(org.springframework.data.domain.Sort.by("createdAt").descending())
            .stream()
            .map(this::toBlogReportResponse)
            .toList();
    }

    /**
     * Get all event reports (any status)
     */
    public List<EventReportResponse> getAllEventReports() {
        return eventReportRepository.findAll(org.springframework.data.domain.Sort.by("createdAt").descending())
            .stream()
            .map(this::toEventReportResponse)
            .toList();
    }

    /**
     * Get blog reports by status
     */
    public List<BlogReportResponse> getBlogReportsByStatus(ReportStatus status) {
        return blogReportRepository.findByStatusOrderByCreatedAtDesc(status)
            .stream()
            .map(this::toBlogReportResponse)
            .toList();
    }

    /**
     * Get event reports by status
     */
    public List<EventReportResponse> getEventReportsByStatus(ReportStatus status) {
        return eventReportRepository.findByStatusOrderByCreatedAtDesc(status)
            .stream()
            .map(this::toEventReportResponse)
            .toList();
    }

    private BlogReportResponse toBlogReportResponse(BlogReport report) {
        User reporter = report.getReportedBy();
        Blog blog = report.getBlog();
        User author = blog != null ? blog.getAuthor() : null;

        return new BlogReportResponse(
            report.getReportId(),
            blog != null ? blog.getBlogId() : null,
            blog != null ? blog.getTitle() : null,
            author != null ? author.getName() : null,
            reporter != null ? reporter.getUserId() : null,
            reporter != null ? reporter.getName() : null,
            report.getReason(),
            report.getStatus(),
            report.getCreatedAt()
        );
    }

    private EventReportResponse toEventReportResponse(EventReport report) {
        User reporter = report.getReportedBy();
        Event event = report.getEvent();
        User creator = event != null ? event.getCreator() : null;

        return new EventReportResponse(
            report.getReportId(),
            event != null ? event.getEventId() : null,
            event != null ? event.getTitle() : null,
            creator != null ? creator.getName() : null,
            reporter != null ? reporter.getUserId() : null,
            reporter != null ? reporter.getName() : null,
            report.getReason(),
            report.getStatus(),
            report.getCreatedAt()
        );
    }

    /**
     * Review blog report (mark as reviewed) - Reporter gets +15 points
     */
    @Transactional
    public void reviewBlogReport(Long reportId) {
        BlogReport report = blogReportRepository.findById(reportId)
            .orElseThrow(() -> new ResourceNotFoundException("BlogReport", "id", reportId));
        
        report.setStatus(ReportStatus.REVIEWED);
        blogReportRepository.save(report);
        
        // Award reporter +15 points for valid report
        User reporter = report.getReportedBy();
        gamificationService.awardPoints(
            reporter,
            15,
            "REPORT_RESOLVED",
            reportId,
            "Your report on blog '" + report.getBlog().getTitle() + "' was resolved"
        );
        
        // Notify reporter
        Notification notification = new Notification();
        notification.setUser(reporter);
        notification.setMessage("Your report on blog '" + report.getBlog().getTitle() + "' was resolved. You earned 15 points!");
        notification.setType(NotificationType.SYSTEM_ALERT);
        notification.setLinkUrl("/blogs/" + report.getBlog().getBlogId());
        notification.setIsRead(false);
        notificationRepository.save(notification);
        
        log.info("Blog report {} resolved, reporter awarded 15 points", reportId);
    }

    /**
     * Dismiss blog report - Reporter gets -50 points penalty
     */
    @Transactional
    public void dismissBlogReport(Long reportId) {
        BlogReport report = blogReportRepository.findById(reportId)
            .orElseThrow(() -> new ResourceNotFoundException("BlogReport", "id", reportId));
        
        report.setStatus(ReportStatus.DISMISSED);
        blogReportRepository.save(report);
        
        // Penalize reporter -50 points for false report
        User reporter = report.getReportedBy();
        gamificationService.deductPoints(
            reporter,
            50,
            "REPORT_DISMISSED",
            reportId,
            "Your report on blog '" + report.getBlog().getTitle() + "' was dismissed (false report)"
        );
        
        // Notify reporter
        Notification notification = new Notification();
        notification.setUser(reporter);
        notification.setMessage("Your report on blog '" + report.getBlog().getTitle() + "' was dismissed. Penalty: -50 points");
        notification.setType(NotificationType.SYSTEM_ALERT);
        notification.setLinkUrl("/blogs/" + report.getBlog().getBlogId());
        notification.setIsRead(false);
        notificationRepository.save(notification);
        
        log.info("Blog report {} dismissed, reporter penalized 50 points", reportId);
    }

    /**
     * Review event report (mark as reviewed) - Reporter gets +15 points
     */
    @Transactional
    public void reviewEventReport(Long reportId) {
        EventReport report = eventReportRepository.findById(reportId)
            .orElseThrow(() -> new ResourceNotFoundException("EventReport", "id", reportId));
        
        report.setStatus(ReportStatus.REVIEWED);
        eventReportRepository.save(report);
        
        // Award reporter +15 points for valid report
        User reporter = report.getReportedBy();
        gamificationService.awardPoints(
            reporter,
            15,
            "REPORT_RESOLVED",
            reportId,
            "Your report on event '" + report.getEvent().getTitle() + "' was resolved"
        );
        
        // Notify reporter
        Notification notification = new Notification();
        notification.setUser(reporter);
        notification.setMessage("Your report on event '" + report.getEvent().getTitle() + "' was resolved. You earned 15 points!");
        notification.setType(NotificationType.SYSTEM_ALERT);
        notification.setLinkUrl("/events/" + report.getEvent().getEventId());
        notification.setIsRead(false);
        notificationRepository.save(notification);
        
        log.info("Event report {} resolved, reporter awarded 15 points", reportId);
    }

    /**
     * Dismiss event report - Reporter gets -50 points penalty
     */
    @Transactional
    public void dismissEventReport(Long reportId) {
        EventReport report = eventReportRepository.findById(reportId)
            .orElseThrow(() -> new ResourceNotFoundException("EventReport", "id", reportId));
        
        report.setStatus(ReportStatus.DISMISSED);
        eventReportRepository.save(report);
        
        // Penalize reporter -50 points for false report
        User reporter = report.getReportedBy();
        gamificationService.deductPoints(
            reporter,
            50,
            "REPORT_DISMISSED",
            reportId,
            "Your report on event '" + report.getEvent().getTitle() + "' was dismissed (false report)"
        );
        
        // Notify reporter
        Notification notification = new Notification();
        notification.setUser(reporter);
        notification.setMessage("Your report on event '" + report.getEvent().getTitle() + "' was dismissed. Penalty: -50 points");
        notification.setType(NotificationType.SYSTEM_ALERT);
        notification.setLinkUrl("/events/" + report.getEvent().getEventId());
        notification.setIsRead(false);
        notificationRepository.save(notification);
        
        log.info("Event report {} dismissed, reporter penalized 50 points", reportId);
    }
}
