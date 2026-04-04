package com.smartcampus.service;

import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Find or create user from Google OAuth
     */
    public User findOrCreateGoogleUser(String email, String name, String googleId, String profilePictureUrl) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Update Google info if not already set
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                user.setProfilePictureUrl(profilePictureUrl);
                userRepository.save(user);
            }
            return user;
        }
        
        // Create new user
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFullName(name);
        newUser.setGoogleId(googleId);
        newUser.setProfilePictureUrl(profilePictureUrl);
        newUser.setRole(UserRole.valueOf("USER"));
        
        return userRepository.save(newUser);
    }

    /**
     * Find user by Google ID
     */
    public Optional<User> findByGoogleId(String googleId) {
        return userRepository.findAll().stream()
                .filter(u -> u.getGoogleId() != null && u.getGoogleId().equals(googleId))
                .findFirst();
    }

    /**
     * Find user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Get or create user by ID
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
}
