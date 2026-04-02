package com.smartcampus.service;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    /**
     * Get all resources with pagination
     */
    public Page<Resource> getAllResources(Pageable pageable) {
        return resourceRepository.findAll(pageable);
    }

    /**
     * Get resource by ID
     */
    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    /**
     * Get all active resources
     */
    public List<Resource> getActiveResources() {
        return resourceRepository.findByStatus(ResourceStatus.ACTIVE);
    }

    /**
     * Get resources by type
     */
    public List<Resource> getResourcesByType(ResourceType type) {
        return resourceRepository.findByType(type);
    }

    /**
     * Get resources by type and status
     */
    public List<Resource> getResourcesByTypeAndStatus(ResourceType type, ResourceStatus status) {
        return resourceRepository.findByTypeAndStatus(type, status);
    }

    /**
     * Search resources by name or location
     */
    public List<Resource> searchResources(String keyword) {
        return resourceRepository.findByNameContainsIgnoreCaseOrLocationContainsIgnoreCase(keyword, keyword);
    }

    /**
     * Create new resource
     */
    public Resource createResource(Resource resource) {
        if (resource.getStatus() == null) {
            resource.setStatus(ResourceStatus.ACTIVE);
        }
        return resourceRepository.save(resource);
    }

    /**
     * Update resource
     */
    public Resource updateResource(String id, Resource resourceDetails) {
        Resource resource = getResourceById(id);
        
        if (resourceDetails.getName() != null) resource.setName(resourceDetails.getName());
        if (resourceDetails.getDescription() != null) resource.setDescription(resourceDetails.getDescription());
        if (resourceDetails.getType() != null) resource.setType(resourceDetails.getType());
        if (resourceDetails.getCapacity() > 0) resource.setCapacity(resourceDetails.getCapacity());
        if (resourceDetails.getLocation() != null) resource.setLocation(resourceDetails.getLocation());
        if (resourceDetails.getStatus() != null) resource.setStatus(resourceDetails.getStatus());
        if (resourceDetails.getImageUrl() != null) resource.setImageUrl(resourceDetails.getImageUrl());
        if (resourceDetails.getContactPerson() != null) resource.setContactPerson(resourceDetails.getContactPerson());
        if (resourceDetails.getPhoneNumber() != null) resource.setPhoneNumber(resourceDetails.getPhoneNumber());
        if (resourceDetails.getEmail() != null) resource.setEmail(resourceDetails.getEmail());
        
        resource.onUpdate();
        return resourceRepository.save(resource);
    }

    /**
     * Delete resource
     */
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    /**
     * Update resource status
     */
    public Resource updateResourceStatus(String id, ResourceStatus status) {
        Resource resource = getResourceById(id);
        resource.setStatus(status);
        resource.onUpdate();
        return resourceRepository.save(resource);
    }

    /**
     * Check if resource exists
     */
    public boolean resourceExists(String id) {
        return resourceRepository.existsById(id);
    }

    /**
     * Get resources by capacity range
     */
    public List<Resource> getResourcesByCapacity(int minCapacity, int maxCapacity) {
        return resourceRepository.findByCapacityBetween(minCapacity, maxCapacity);
    }

    /**
     * Get resources by location
     */
    public List<Resource> getResourcesByLocation(String location) {
        return resourceRepository.findByLocationContainsIgnoreCase(location);
    }
}
