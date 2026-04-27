package com.smartcampus.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private final int MAX_ATTEMPTS = 3;
    private final int BLOCK_DURATION_MINUTES = 1;

    // Cache to store the number of failed attempts
    private ConcurrentHashMap<String, Integer> attemptsCache = new ConcurrentHashMap<>();
    
    // Cache to store the expiration time of the block
    private ConcurrentHashMap<String, LocalDateTime> blockCache = new ConcurrentHashMap<>();

    public void loginSucceeded(String key) {
        attemptsCache.remove(key);
        blockCache.remove(key);
    }

    public void loginFailed(String key) {
        int attempts = attemptsCache.getOrDefault(key, 0);
        attempts++;
        attemptsCache.put(key, attempts);
        
        if (attempts >= MAX_ATTEMPTS) {
            blockCache.put(key, LocalDateTime.now().plusMinutes(BLOCK_DURATION_MINUTES));
        }
    }

    public boolean isBlocked(String key) {
        if (blockCache.containsKey(key)) {
            if (blockCache.get(key).isBefore(LocalDateTime.now())) {
                // Block expired
                blockCache.remove(key);
                attemptsCache.remove(key);
                return false;
            }
            return true;
        }
        return false;
    }
}
