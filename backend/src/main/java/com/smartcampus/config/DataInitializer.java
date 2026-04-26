package com.smartcampus.config;

import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceType;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.repository.ResourceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;
import java.util.Arrays;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initializeData(UserRepository userRepository, ResourceRepository resourceRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Create test user if it doesn't exist
            if (userRepository.findByEmail("test@smartcampus.com").isEmpty()) {
                User testUser = new User();
                testUser.setEmail("test@smartcampus.com");
                testUser.setPassword(passwordEncoder.encode("Test@123"));
                testUser.setFullName("Test User");
                testUser.setRole(UserRole.ADMIN);
                testUser.setActive(true);
                testUser.setCreatedAt(LocalDateTime.now());
                testUser.setUpdatedAt(LocalDateTime.now());
                testUser.setDepartment("IT");
                testUser.setPhoneNumber("1234567890");
                
                userRepository.save(testUser);
                System.out.println("✅ Test user created: test@smartcampus.com / Test@123");
            }

            // Create default technician user if it doesn't exist
            if (userRepository.findByEmail("technician@gmail.com").isEmpty()) {
                User technicianUser = new User();
                technicianUser.setEmail("technician@gmail.com");
                technicianUser.setPassword(passwordEncoder.encode("technicianPass123"));
                technicianUser.setFullName("Campus Technician");
                technicianUser.setRole(UserRole.TECHNICIAN);
                technicianUser.setActive(true);
                technicianUser.setCreatedAt(LocalDateTime.now());
                technicianUser.setUpdatedAt(LocalDateTime.now());
                technicianUser.setDepartment("Maintenance");
                technicianUser.setPhoneNumber("1234567891");

                userRepository.save(technicianUser);
                System.out.println("✅ Technician user created: technician@gmail.com / technicianPass123");
            }
            
            // Create sample resources if they don't exist
            if (resourceRepository.count() == 0) {
                Resource resource1 = new Resource();
                resource1.setName("Main Meeting Room");
                resource1.setDescription("Large meeting room with projector and video conferencing equipment");
                resource1.setType(ResourceType.MEETING_ROOM);
                resource1.setCapacity(20);
                resource1.setLocation("Building A, 3rd Floor");
                resource1.setStatus(ResourceStatus.ACTIVE);
                resource1.setContactPerson("John Smith");
                resource1.setPhoneNumber("555-0101");
                resource1.setEmail("conference@smartcampus.com");
                resource1.setTags(Arrays.asList("conference", "meeting", "video-call"));
                resource1.setCreatedAt(LocalDateTime.now());
                resource1.setUpdatedAt(LocalDateTime.now());
                resource1.setCreatedBy("admin");
                resourceRepository.save(resource1);
                
                Resource resource2 = new Resource();
                resource2.setName("Lecture Hall A");
                resource2.setDescription("Large lecture hall with advanced audio-visual setup for presentations");
                resource2.setType(ResourceType.LECTURE_HALL);
                resource2.setCapacity(150);
                resource2.setLocation("Building B, Ground Floor");
                resource2.setStatus(ResourceStatus.ACTIVE);
                resource2.setContactPerson("Maria Garcia");
                resource2.setPhoneNumber("555-0102");
                resource2.setEmail("lecture@smartcampus.com");
                resource2.setTags(Arrays.asList("lecture", "classroom", "presentation"));
                resource2.setCreatedAt(LocalDateTime.now());
                resource2.setUpdatedAt(LocalDateTime.now());
                resource2.setCreatedBy("admin");
                resourceRepository.save(resource2);
                
                Resource resource3 = new Resource();
                resource3.setName("Computer Lab");
                resource3.setDescription("Well-equipped computer lab with 50 workstations and networking equipment");
                resource3.setType(ResourceType.LAB);
                resource3.setCapacity(50);
                resource3.setLocation("Building C, 2nd Floor");
                resource3.setStatus(ResourceStatus.ACTIVE);
                resource3.setContactPerson("David Wilson");
                resource3.setPhoneNumber("555-0103");
                resource3.setEmail("lab@smartcampus.com");
                resource3.setTags(Arrays.asList("lab", "computer", "equipment"));
                resource3.setCreatedAt(LocalDateTime.now());
                resource3.setUpdatedAt(LocalDateTime.now());
                resource3.setCreatedBy("admin");
                resourceRepository.save(resource3);
                
                Resource resource4 = new Resource();
                resource4.setName("Outdoor Sports Area");
                resource4.setDescription("Multi-purpose outdoor space for sports and recreational activities");
                resource4.setType(ResourceType.OUTDOOR_SPACE);
                resource4.setCapacity(200);
                resource4.setLocation("Campus Grounds");
                resource4.setStatus(ResourceStatus.ACTIVE);
                resource4.setContactPerson("Sarah Johnson");
                resource4.setPhoneNumber("555-0104");
                resource4.setEmail("sports@smartcampus.com");
                resource4.setTags(Arrays.asList("sports", "outdoor", "recreation"));
                resource4.setCreatedAt(LocalDateTime.now());
                resource4.setUpdatedAt(LocalDateTime.now());
                resource4.setCreatedBy("admin");
                resourceRepository.save(resource4);
                
                Resource resource5 = new Resource();
                resource5.setName("4K Projector - Premium");
                resource5.setDescription("High-end 4K projector with laser technology for presentations");
                resource5.setType(ResourceType.EQUIPMENT);
                resource5.setCapacity(1);
                resource5.setLocation("AV Equipment Room");
                resource5.setStatus(ResourceStatus.ACTIVE);
                resource5.setContactPerson("Tom Brown");
                resource5.setPhoneNumber("555-0105");
                resource5.setEmail("equipment@smartcampus.com");
                resource5.setTags(Arrays.asList("projector", "equipment", "av"));
                resource5.setCreatedAt(LocalDateTime.now());
                resource5.setUpdatedAt(LocalDateTime.now());
                resource5.setCreatedBy("admin");
                resourceRepository.save(resource5);
                
                System.out.println("✅ 5 sample resources created successfully!");
            }
        };
    }
}
