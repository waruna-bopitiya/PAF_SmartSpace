package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceType;
import com.smartcampus.model.ResourceStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByType(ResourceType type);

    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    @Query("{ 'type': ?0, 'status': 'ACTIVE' }")
    List<Resource> findActiveByType(ResourceType type);

    @Query("{ 'capacity': { $gte: ?0 }, 'status': 'ACTIVE' }")
    List<Resource> findActiveByMinCapacity(Integer minCapacity);
}
