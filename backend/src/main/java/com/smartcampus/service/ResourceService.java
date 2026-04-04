package com.smartcampus.service;

import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.ResourceRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class ResourceService {
    private final ResourceRepository resourceRepository;

    public ResourceDTO createResource(ResourceDTO resourceDTO) {
        Resource resource = Resource.builder()
                .name(resourceDTO.getName())
                .description(resourceDTO.getDescription())
                .type(ResourceType.valueOf(resourceDTO.getType()))
                .capacity(resourceDTO.getCapacity())
                .location(resourceDTO.getLocation())
                .status(ResourceStatus.ACTIVE)
                .imageUrl(resourceDTO.getImageUrl())
                .build();
        
        resource.onCreate();
        Resource saved = resourceRepository.save(resource);
        return convertToDTO(saved);
    }

    public ResourceDTO getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));
        return convertToDTO(resource);
    }

    public List<ResourceDTO> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ResourceDTO> getResourcesByType(String type) {
        List<Resource> resources = resourceRepository.findByType(ResourceType.valueOf(type));
        return resources.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ResourceDTO> getResourcesByLocation(String location) {
        List<Resource> resources = resourceRepository.findByLocationContainingIgnoreCase(location);
        return resources.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ResourceDTO updateResource(String id, ResourceDTO resourceDTO) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));

        resource.setName(resourceDTO.getName());
        resource.setDescription(resourceDTO.getDescription());
        resource.setCapacity(resourceDTO.getCapacity());
        resource.setLocation(resourceDTO.getLocation());
        if (resourceDTO.getStatus() != null) {
            resource.setStatus(ResourceStatus.valueOf(resourceDTO.getStatus()));
        }
        resource.onUpdate();

        Resource updated = resourceRepository.save(resource);
        return convertToDTO(updated);
    }

    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with ID: " + id);
        }
        resourceRepository.deleteById(id);
    }

    public List<ResourceDTO> searchResources(String type, Integer minCapacity, String location) {
        List<Resource> resources = resourceRepository.findAll().stream()
                .filter(r -> type == null || r.getType().toString().equals(type))
                .filter(r -> minCapacity == null || r.getCapacity() >= minCapacity)
                .filter(r -> location == null || r.getLocation().toLowerCase().contains(location.toLowerCase()))
                .filter(r -> r.getStatus() == ResourceStatus.ACTIVE)
                .collect(Collectors.toList());

        return resources.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ResourceDTO convertToDTO(Resource resource) {
        return ResourceDTO.builder()
                .id(resource.getId())
                .name(resource.getName())
                .description(resource.getDescription())
                .type(resource.getType().toString())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .status(resource.getStatus().toString())
                .imageUrl(resource.getImageUrl())
                .build();
    }
}
