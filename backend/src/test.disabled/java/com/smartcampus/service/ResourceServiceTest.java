package com.smartcampus.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.repository.ResourceRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("Resource Service Tests")
class ResourceServiceTest {

  @Mock
  private ResourceRepository resourceRepository;

  @InjectMocks
  private ResourceService resourceService;

  private Resource testResource;

  @BeforeEach
  void setUp() {
    testResource = new Resource();
    testResource.setId(new org.bson.types.ObjectId().toString());
    testResource.setName("Lab 101");
    testResource.setType(ResourceType.LAB);
    testResource.setCapacity(30);
    testResource.setLocation("Building A, Floor 1");
    testResource.setStatus(ResourceStatus.ACTIVE);
    testResource.setDescription("Computer lab with 30 workstations");
  }

  @Test
  @DisplayName("Should get all resources")
  void testGetAllResources() {
    // Arrange
    Page<Resource> resourcePage = new PageImpl<>(Arrays.asList(testResource));
    when(resourceRepository.findAll(PageRequest.of(0, 10))).thenReturn(resourcePage);

    // Act
    Page<Resource> result = resourceService.getAllResources(PageRequest.of(0, 10));

    // Assert
    assertEquals(1, result.getContent().size());
    assertEquals("Lab 101", result.getContent().get(0).getName());
    verify(resourceRepository, times(1)).findAll(PageRequest.of(0, 10));
  }

  @Test
  @DisplayName("Should get resource by ID")
  void testGetResourceById() {
    // Arrange
    when(resourceRepository.findById(testResource.getId())).thenReturn(Optional.of(testResource));

    // Act
    Optional<Resource> result = resourceService.getResourceById(testResource.getId());

    // Assert
    assertTrue(result.isPresent());
    assertEquals("Lab 101", result.get().getName());
    verify(resourceRepository, times(1)).findById(testResource.getId());
  }

  @Test
  @DisplayName("Should get resources by type")
  void testGetResourcesByType() {
    // Arrange
    when(resourceRepository.findByType(ResourceType.LAB)).thenReturn(Arrays.asList(testResource));

    // Act
    List<Resource> result = resourceService.getResourcesByType(ResourceType.LAB);

    // Assert
    assertEquals(1, result.size());
    assertEquals(ResourceType.LAB, result.get(0).getType());
    verify(resourceRepository, times(1)).findByType(ResourceType.LAB);
  }

  @Test
  @DisplayName("Should get active resources")
  void testGetActiveResources() {
    // Arrange
    when(resourceRepository.findByStatus(ResourceStatus.ACTIVE)).thenReturn(Arrays.asList(testResource));

    // Act
    List<Resource> result = resourceService.getResourcesByStatus(ResourceStatus.ACTIVE);

    // Assert
    assertEquals(1, result.size());
    assertEquals(ResourceStatus.ACTIVE, result.get(0).getStatus());
    verify(resourceRepository, times(1)).findByStatus(ResourceStatus.ACTIVE);
  }

  @Test
  @DisplayName("Should create resource")
  void testCreateResource() {
    // Arrange
    when(resourceRepository.save(any(Resource.class))).thenReturn(testResource);

    // Act
    Resource result = resourceService.createResource(testResource);

    // Assert
    assertNotNull(result);
    assertEquals("Lab 101", result.getName());
    verify(resourceRepository, times(1)).save(any(Resource.class));
  }

  @Test
  @DisplayName("Should update resource")
  void testUpdateResource() {
    // Arrange
    testResource.setName("Updated Lab");
    when(resourceRepository.findById(testResource.getId())).thenReturn(Optional.of(testResource));
    when(resourceRepository.save(any(Resource.class))).thenReturn(testResource);

    // Act
    Resource result = resourceService.updateResource(testResource.getId(), testResource);

    // Assert
    assertEquals("Updated Lab", result.getName());
    verify(resourceRepository, times(1)).save(any(Resource.class));
  }

  @Test
  @DisplayName("Should delete resource")
  void testDeleteResource() {
    // Arrange
    when(resourceRepository.existsById(testResource.getId())).thenReturn(true);

    // Act
    resourceService.deleteResource(testResource.getId());

    // Assert
    verify(resourceRepository, times(1)).deleteById(testResource.getId());
  }

  @Test
  @DisplayName("Should throw exception when deleting non-existent resource")
  void testDeleteNonExistentResource() {
    // Arrange
    String nonExistentId = "nonexistent";
    when(resourceRepository.existsById(nonExistentId)).thenReturn(false);

    // Act & Assert
    assertThrows(RuntimeException.class, () -> resourceService.deleteResource(nonExistentId));
    verify(resourceRepository, never()).deleteById(nonExistentId);
  }
}
