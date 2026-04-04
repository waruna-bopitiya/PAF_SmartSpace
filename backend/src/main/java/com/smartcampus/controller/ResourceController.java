package com.smartcampus.controller;

import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

// Controller for managing campus resources (e.g., rooms, equipment)
@RestController
@RequestMapping("/resources")
@CrossOrigin(origins = "http://localhost:3000")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private ModelMapper modelMapper;

    /**
     * Get all resources with pagination
     * GET /resources?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<?> getAllResources(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Resource> resources = resourceService.getAllResources(pageable);
            Page<ResourceDTO> dtos = resources.map(r -> modelMapper.map(r, ResourceDTO.class));
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching resources: " + e.getMessage());
        }
    }

    /**
     * Get resource by ID
     * GET /resources/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getResourceById(@PathVariable String id) {
        try {
            Resource resource = resourceService.getResourceById(id);
            ResourceDTO dto = modelMapper.map(resource, ResourceDTO.class);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Resource not found: " + e.getMessage());
        }
    }

    /**
     * Get all active resources
     * GET /resources/active
     */
    @GetMapping("/status/active")
    public ResponseEntity<?> getActiveResources() {
        try {
            List<Resource> resources = resourceService.getActiveResources();
            List<ResourceDTO> dtos = resources.stream()
                    .map(r -> modelMapper.map(r, ResourceDTO.class))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching active resources: " + e.getMessage());
        }
    }

    /**
     * Get resources by type
     * GET /resources/type/{type}
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<?> getResourcesByType(@PathVariable String type) {
        try {
            ResourceType resourceType = ResourceType.fromString(type);
            List<Resource> resources = resourceService.getResourcesByType(resourceType);
            List<ResourceDTO> dtos = resources.stream()
                    .map(r -> modelMapper.map(r, ResourceDTO.class))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error fetching resources by type: " + e.getMessage());
        }
    }

    /**
     * Search resources by keyword
     * GET /resources/search?keyword=lab
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchResources(@RequestParam String keyword) {
        try {
            List<Resource> resources = resourceService.searchResources(keyword);
            List<ResourceDTO> dtos = resources.stream()
                    .map(r -> modelMapper.map(r, ResourceDTO.class))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error searching resources: " + e.getMessage());
        }
    }

    /**
     * Create new resource
     * POST /resources
     */
    @PostMapping
    public ResponseEntity<?> createResource(@Valid @RequestBody ResourceDTO resourceDTO) {
        try {
            Resource resource = modelMapper.map(resourceDTO, Resource.class);
            Resource savedResource = resourceService.createResource(resource);
            ResourceDTO responseDTO = modelMapper.map(savedResource, ResourceDTO.class);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating resource: " + e.getMessage());
        }
    }

    /**
     * Update resource
     * PUT /resources/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateResource(@PathVariable String id,
                                           @Valid @RequestBody ResourceDTO resourceDTO) {
        try {
            Resource resourceDetails = modelMapper.map(resourceDTO, Resource.class);
            Resource updatedResource = resourceService.updateResource(id, resourceDetails);
            ResourceDTO responseDTO = modelMapper.map(updatedResource, ResourceDTO.class);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error updating resource: " + e.getMessage());
        }
    }

    /**
     * Update resource status
     * PATCH /resources/{id}/status?status=MAINTENANCE
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateResourceStatus(@PathVariable String id,
                                                 @RequestParam String status) {
        try {
            ResourceStatus resourceStatus = ResourceStatus.fromString(status);
            Resource updatedResource = resourceService.updateResourceStatus(id, resourceStatus);
            ResourceDTO responseDTO = modelMapper.map(updatedResource, ResourceDTO.class);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error updating resource status: " + e.getMessage());
        }
    }

    /**
     * Delete resource
     * DELETE /resources/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable String id) {
        try {
            resourceService.deleteResource(id);
            return ResponseEntity.ok("Resource deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error deleting resource: " + e.getMessage());
        }
    }

    /**
     * Get resources by location
     * GET /resources/location/{location}
     */
    @GetMapping("/location/{location}")
    public ResponseEntity<?> getResourcesByLocation(@PathVariable String location) {
        try {
            List<Resource> resources = resourceService.getResourcesByLocation(location);
            List<ResourceDTO> dtos = resources.stream()
                    .map(r -> modelMapper.map(r, ResourceDTO.class))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching resources by location: " + e.getMessage());
        }
    }
}
