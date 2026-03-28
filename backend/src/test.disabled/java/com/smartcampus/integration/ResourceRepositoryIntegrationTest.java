package com.smartcampus.integration;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.repository.ResourceRepository;

@Testcontainers
@DataMongoTest
@Import(ResourceRepository.class)
@DisplayName("Resource Repository Integration Tests")
class ResourceRepositoryIntegrationTest {

  @Container
  static MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:latest")
      .withExposedPorts(27017);

  @Autowired
  private ResourceRepository resourceRepository;

  private Resource testResource;

  @BeforeEach
  void setUp() {
    resourceRepository.deleteAll();

    testResource = new Resource();
    testResource.setName("Lab 101");
    testResource.setType(ResourceType.LAB);
    testResource.setCapacity(30);
    testResource.setLocation("Building A, Floor 1");
    testResource.setStatus(ResourceStatus.ACTIVE);
    testResource.setDescription("Computer lab with 30 workstations");
  }

  @Test
  @DisplayName("Should save and retrieve resource from MongoDB")
  void testSaveAndRetrieveResource() {
    // Act
    Resource saved = resourceRepository.save(testResource);

    // Assert
    assertNotNull(saved.getId());
    assertEquals("Lab 101", saved.getName());

    Resource retrieved = resourceRepository.findById(saved.getId()).orElse(null);
    assertNotNull(retrieved);
    assertEquals("Lab 101", retrieved.getName());
  }

  @Test
  @DisplayName("Should find resources by type")
  void testFindByType() {
    // Arrange
    resourceRepository.save(testResource);

    // Act
    List<Resource> results = resourceRepository.findByType(ResourceType.LAB);

    // Assert
    assertEquals(1, results.size());
    assertEquals(ResourceType.LAB, results.get(0).getType());
  }

  @Test
  @DisplayName("Should find resources by status")
  void testFindByStatus() {
    // Arrange
    resourceRepository.save(testResource);

    // Act
    List<Resource> results = resourceRepository.findByStatus(ResourceStatus.ACTIVE);

    // Assert
    assertEquals(1, results.size());
    assertEquals(ResourceStatus.ACTIVE, results.get(0).getStatus());
  }

  @Test
  @DisplayName("Should find resources by location")
  void testFindByLocation() {
    // Arrange
    resourceRepository.save(testResource);

    // Act
    List<Resource> results = resourceRepository.findByLocation("Building A, Floor 1");

    // Assert
    assertEquals(1, results.size());
    assertEquals("Building A, Floor 1", results.get(0).getLocation());
  }

  @Test
  @DisplayName("Should update resource")
  void testUpdateResource() {
    // Arrange
    Resource saved = resourceRepository.save(testResource);
    saved.setName("Updated Lab 101");
    saved.setCapacity(40);

    // Act
    Resource updated = resourceRepository.save(saved);

    // Assert
    assertEquals("Updated Lab 101", updated.getName());
    assertEquals(40, updated.getCapacity());
  }

  @Test
  @DisplayName("Should delete resource")
  void testDeleteResource() {
    // Arrange
    Resource saved = resourceRepository.save(testResource);

    // Act
    resourceRepository.delete(saved);

    // Assert
    assertFalse(resourceRepository.findById(saved.getId()).isPresent());
  }

  @Test
  @DisplayName("Should count resources by status")
  void testCountByStatus() {
    // Arrange
    resourceRepository.save(testResource);
    Resource maintenance = new Resource();
    maintenance.setName("Lab 102");
    maintenance.setType(ResourceType.LAB);
    maintenance.setCapacity(25);
    maintenance.setLocation("Building B");
    maintenance.setStatus(ResourceStatus.MAINTENANCE);
    resourceRepository.save(maintenance);

    // Act
    long activeCount = resourceRepository.countByStatus(ResourceStatus.ACTIVE);
    long maintenanceCount = resourceRepository.countByStatus(ResourceStatus.MAINTENANCE);

    // Assert
    assertEquals(1, activeCount);
    assertEquals(1, maintenanceCount);
  }

  @Test
  @DisplayName("Should handle pagination")
  void testPagination() {
    // Arrange
    for (int i = 1; i <= 15; i++) {
      Resource resource = new Resource();
      resource.setName("Lab " + i);
      resource.setType(ResourceType.LAB);
      resource.setCapacity(30);
      resource.setLocation("Building A");
      resource.setStatus(ResourceStatus.ACTIVE);
      resourceRepository.save(resource);
    }

    // Act
    Page<Resource> firstPage = resourceRepository.findAll(PageRequest.of(0, 10));
    Page<Resource> secondPage = resourceRepository.findAll(PageRequest.of(1, 10));

    // Assert
    assertEquals(2, firstPage.getTotalPages());
    assertEquals(10, firstPage.getContent().size());
    assertEquals(5, secondPage.getContent().size());
  }
}
