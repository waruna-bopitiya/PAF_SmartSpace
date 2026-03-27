package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceType;
import com.smartcampus.model.ResourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByType(ResourceType type);

    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    @Query("SELECT r FROM Resource r WHERE r.type = :type AND r.status = 'ACTIVE'")
    List<Resource> findActiveByType(ResourceType type);

    @Query("SELECT r FROM Resource r WHERE r.capacity >= :minCapacity AND r.status = 'ACTIVE'")
    List<Resource> findActiveByMinCapacity(Integer minCapacity);
}
