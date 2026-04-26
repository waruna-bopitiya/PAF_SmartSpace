package com.smartcampus.repository;
// Repository interface for Resource entity, extending MongoRepository for CRUD operations
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

// Repository interface for Resource entity, extending MongoRepository for CRUD operations
@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByStatus(ResourceStatus status);
    List<Resource> findByType(ResourceType type);
    List<Resource> findByTypeAndStatus(ResourceType type, ResourceStatus status);
    List<Resource> findByNameContainsIgnoreCaseOrLocationContainsIgnoreCase(String name, String location);
    List<Resource> findByCapacityBetween(int minCapacity, int maxCapacity);
    List<Resource> findByLocationContainsIgnoreCase(String location);
}
