package com.example.unihub.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateEventRequest {
    
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    private LocalDateTime startDate;
    
    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDateTime endDate;
    
    @NotBlank(message = "Type is required")
    private String type;
    
    // University ID for the event (if not provided, defaults to creator's university)
    private Long universityId;
    
    // Capacity fields (optional - null means unlimited)
    private Integer maxOrganizers;
    private Integer maxVolunteers;
    private Integer maxAttendees;
    
    // Custom points (optional - will use defaults if not provided)
    private Integer organizerPoints;
    private Integer volunteerPoints;
    private Integer attendeePoints;
    
    // Whether creator wants to participate and in what role
    private Boolean creatorParticipates = false;
    private String creatorRole; // ORGANIZER, VOLUNTEER, or ATTENDEE
}
