package com.smartcampus.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.repository.ResourceRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Resource Controller Integration Tests")
class ResourceControllerIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ResourceRepository resourceRepository;

  @Autowired
  private ObjectMapper objectMapper;

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
  @DisplayName("Should get all resources")
  void testGetAllResources() throws Exception {
    // Arrange
    resourceRepository.save(testResource);

    // Act & Assert
    mockMvc.perform(get("/resources")
        .contentType(MediaType.APPLICATION_JSON)
        .param("page", "0")
        .param("size", "10"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content", hasSize(1)))
        .andExpect(jsonPath("$.content[0].name", equalTo("Lab 101")));
  }

  @Test
  @DisplayName("Should get resource by ID")
  void testGetResourceById() throws Exception {
    // Arrange
    Resource saved = resourceRepository.save(testResource);

    // Act & Assert
    mockMvc.perform(get("/resources/" + saved.getId())
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name", equalTo("Lab 101")))
        .andExpect(jsonPath("$.type", equalTo("LAB")));
  }

  @Test
  @DisplayName("Should get active resources")
  void testGetActiveResources() throws Exception {
    // Arrange
    resourceRepository.save(testResource);

    // Act & Assert
    mockMvc.perform(get("/resources/status/active")
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].status", equalTo("ACTIVE")));
  }

  @Test
  @DisplayName("Should create resource")
  void testCreateResource() throws Exception {
    // Arrange
    String resourceJson = objectMapper.writeValueAsString(testResource);

    // Act & Assert
    mockMvc.perform(post("/resources")
        .contentType(MediaType.APPLICATION_JSON)
        .content(resourceJson))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.name", equalTo("Lab 101")))
        .andExpect(jsonPath("$.status", equalTo("ACTIVE")));
  }

  @Test
  @DisplayName("Should update resource")
  void testUpdateResource() throws Exception {
    // Arrange
    Resource saved = resourceRepository.save(testResource);
    saved.setName("Updated Lab");
    String resourceJson = objectMapper.writeValueAsString(saved);

    // Act & Assert
    mockMvc.perform(put("/resources/" + saved.getId())
        .contentType(MediaType.APPLICATION_JSON)
        .content(resourceJson))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name", equalTo("Updated Lab")));
  }

  @Test
  @DisplayName("Should update resource status")
  void testUpdateResourceStatus() throws Exception {
    // Arrange
    Resource saved = resourceRepository.save(testResource);

    // Act & Assert
    mockMvc.perform(patch("/resources/" + saved.getId() + "/status")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"status\": \"MAINTENANCE\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status", equalTo("MAINTENANCE")));
  }

  @Test
  @DisplayName("Should delete resource")
  void testDeleteResource() throws Exception {
    // Arrange
    Resource saved = resourceRepository.save(testResource);

    // Act & Assert
    mockMvc.perform(delete("/resources/" + saved.getId()))
        .andExpect(status().isNoContent());

    // Verify it's deleted
    mockMvc.perform(get("/resources/" + saved.getId()))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Should return 404 for non-existent resource")
  void testGetNonExistentResource() throws Exception {
    mockMvc.perform(get("/resources/invalid-id"))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Should validate resource creation with invalid data")
  void testCreateResourceWithInvalidData() throws Exception {
    // Arrange
    String invalidJson = "{\"name\": \"\", \"capacity\": -1}";

    // Act & Assert
    mockMvc.perform(post("/resources")
        .contentType(MediaType.APPLICATION_JSON)
        .content(invalidJson))
        .andExpect(status().isBadRequest());
  }
}
