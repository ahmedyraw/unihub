package com.example.unihub.config;

import com.example.unihub.model.Badge;
import com.example.unihub.model.University;
import com.example.unihub.repository.BadgeRepository;
import com.example.unihub.repository.UniversityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final BadgeRepository badgeRepository;
    private final UniversityRepository universityRepository;

    @Override
    public void run(String... args) {
        initializeBadges();
        initializeSampleUniversity();
    }

    private void initializeBadges() {
        if (badgeRepository.count() == 0) {
            log.info("Initializing gaming-inspired badges...");

            Badge campusExplorer = new Badge();
            campusExplorer.setName("Campus Explorer");
            campusExplorer.setDescription("🎮 Welcome to UniHub! Your journey begins.");
            campusExplorer.setPointsThreshold(0);
            badgeRepository.save(campusExplorer);

            Badge risingStar = new Badge();
            risingStar.setName("Rising Star");
            risingStar.setDescription("⚡ You're making progress! Keep it up.");
            risingStar.setPointsThreshold(100);
            badgeRepository.save(risingStar);

            Badge communityChampion = new Badge();
            communityChampion.setName("Community Champion");
            communityChampion.setDescription("🌟 Active contributor to the community.");
            communityChampion.setPointsThreshold(500);
            badgeRepository.save(communityChampion);

            Badge eliteContributor = new Badge();
            eliteContributor.setName("Elite Contributor");
            eliteContributor.setDescription("💎 Outstanding dedication and participation.");
            eliteContributor.setPointsThreshold(1000);
            badgeRepository.save(eliteContributor);

            Badge legend = new Badge();
            legend.setName("Legend");
            legend.setDescription("👑 Exceptional leadership and impact.");
            legend.setPointsThreshold(2500);
            badgeRepository.save(legend);

            Badge grandmaster = new Badge();
            grandmaster.setName("Grandmaster");
            grandmaster.setDescription("🏆 The ultimate UniHub champion!");
            grandmaster.setPointsThreshold(5000);
            badgeRepository.save(grandmaster);

            log.info("Initialized {} gaming-inspired badges", badgeRepository.count());
        }
    }

    private void initializeSampleUniversity() {
        log.info("Ensuring Jordanian universities are available...");

        // Public Universities
        ensureUniversity(
                "University of Jordan",
                "The largest and oldest university in Jordan, located in Amman",
                "https://ju.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Jordan University of Science and Technology",
                "A leading technological university in Irbid",
                "https://just.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Yarmouk University",
                "A major public university in Irbid",
                "https://yu.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Hashemite University",
                "A public university in Zarqa",
                "https://hu.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Mutah University",
                "Located in Karak, known for military sciences",
                "https://mutah.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Al al-Bayt University",
                "Public university in Mafraq",
                "https://aabu.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Al-Balqa Applied University",
                "Applied sciences university in Salt",
                "https://bau.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Tafila Technical University",
                "Technical university in Tafila",
                "https://ttu.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Al-Hussein Bin Talal University",
                "Public university in Ma'an",
                "https://ahu.edu.jo/images/logo.png"
        );

        // Specialized Public Universities
        ensureUniversity(
                "German Jordanian University",
                "A partnership between Germany and Jordan, located in Amman",
                "https://gju.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Princess Sumaya University for Technology",
                "Private university specialized in technology and IT",
                "https://psut.edu.jo/images/logo.png"
        );

        // Private Universities
        ensureUniversity(
                "Applied Science Private University",
                "Private university in Amman",
                "https://asu.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Philadelphia University",
                "Private university in Amman",
                "https://philadelphia.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Isra University",
                "Private university in Amman",
                "https://iu.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Petra University",
                "Private university in Amman",
                "https://uop.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Zarqa University",
                "Private university in Zarqa",
                "https://zu.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Jerash University",
                "Private university in Jerash",
                "https://jpu.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Irbid National University",
                "Private university in Irbid",
                "https://inu.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Ajloun National University",
                "Private university in Ajloun",
                "https://anu.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Al-Ahliyya Amman University",
                "Private university in Amman",
                "https://ammanu.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Middle East University",
                "Private university in Amman",
                "https://meu.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Al-Zaytoonah University of Jordan",
                "Private university in Amman",
                "https://zuj.edu.jo/images/logo.png"
        );

        ensureUniversity(
                "Jadara University",
                "Private university in Irbid",
                "https://jadara.edu.jo/images/logo.png"
        );

        log.info("Jordanian universities check completed - {} universities available", universityRepository.count());
    }

    private void ensureUniversity(String name, String description, String logoUrl) {
        if (universityRepository.existsByName(name)) {
            return;
        }

        University university = new University();
        university.setName(name);
        university.setDescription(description);
        university.setLogoUrl(logoUrl);
        universityRepository.save(university);
    }
}
