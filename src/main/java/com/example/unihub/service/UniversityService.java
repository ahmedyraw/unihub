package com.example.unihub.service;

import com.example.unihub.exception.ResourceNotFoundException;
import com.example.unihub.model.University;
import com.example.unihub.repository.UniversityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UniversityService {

    private final UniversityRepository universityRepository;

    /**
     * Get all universities
     */
    public List<University> getAllUniversities() {
        return universityRepository.findAll().stream()
            .filter(university -> !"Example University".equalsIgnoreCase(university.getName()))
            .toList();
    }

    /**
     * Get university by ID
     */
    public University getUniversityById(Long universityId) {
        return universityRepository.findById(universityId)
            .orElseThrow(() -> new ResourceNotFoundException("University", "id", universityId));
    }

    /**
     * Create a new university (Admin only)
     */
    @Transactional
    public University createUniversity(String name, String description, String logoUrl) {
        log.info("Creating new university: {}", name);
        
        if (universityRepository.existsByName(name)) {
            throw new IllegalArgumentException("University with this name already exists");
        }

        if (logoUrl == null || logoUrl.isBlank()) {
            throw new IllegalArgumentException("Logo URL is required");
        }
        
        University university = new University();
        university.setName(name);
        university.setDescription(description);
        university.setLogoUrl(logoUrl);
        
        return universityRepository.save(university);
    }

    /**
     * Update university (Admin only)
     */
    @Transactional
    public University updateUniversity(Long universityId, String name, String description, String logoUrl) {
        University university = getUniversityById(universityId);
        
        if (name != null && !name.isBlank()) {
            // Check if new name conflicts with existing university
            if (!name.equals(university.getName()) && universityRepository.existsByName(name)) {
                throw new IllegalArgumentException("University with this name already exists");
            }
            university.setName(name);
        }
        
        if (description != null) {
            university.setDescription(description);
        }
        
        if (logoUrl != null) {
            university.setLogoUrl(logoUrl);
        }
        
        return universityRepository.save(university);
    }

    /**
     * Delete university (Admin only)
     */
    @Transactional
    public void deleteUniversity(Long universityId) {
        University university = getUniversityById(universityId);
        universityRepository.delete(university);
        log.info("University {} deleted", universityId);
    }
}
